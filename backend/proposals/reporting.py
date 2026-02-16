"""
Report Generation Module.
Generates PDF and Word documents for proposals and reviews.
"""
import io
import logging
from xml.sax.saxutils import escape

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone


logger = logging.getLogger(__name__)


def _safe_text(value):
    """Escape dynamic values before inserting into ReportLab Paragraph markup."""
    if value is None:
        return ""
    return escape(str(value))


def generate_combined_review_pdf(proposal):
    """
    Generate a combined PDF report with all reviews for a proposal.
    
    Args:
        proposal: Proposal instance
        
    Returns:
        BytesIO buffer containing the PDF
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        # Fallback if reportlab is not installed
        buffer = io.BytesIO()
        buffer.write(b"Report generation requires reportlab. Please install it with: pip install reportlab")
        buffer.seek(0)
        return buffer
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph("Combined Review Report", title_style))
    story.append(Spacer(1, 12))
    
    # Proposal Details
    fund_requested = proposal.fund_requested
    if fund_requested is None:
        fund_requested_text = "N/A"
    else:
        fund_requested_text = f"${fund_requested:,.2f}"
    story.append(Paragraph(f"<b>Proposal Code:</b> {_safe_text(proposal.proposal_code)}", styles['Normal']))
    story.append(Paragraph(f"<b>Title:</b> {_safe_text(proposal.title)}", styles['Normal']))
    story.append(Paragraph(f"<b>PI:</b> {_safe_text(proposal.pi_name)}", styles['Normal']))
    story.append(Paragraph(f"<b>Department:</b> {_safe_text(proposal.pi_department)}", styles['Normal']))
    story.append(Paragraph(f"<b>Funding Requested:</b> {_safe_text(fund_requested_text)}", styles['Normal']))
    story.append(Paragraph(f"<b>Status:</b> {_safe_text(proposal.get_status_display())}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Stage 1 Reviews
    story.append(Paragraph("Stage 1 Reviews", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    from reviews.models import ReviewAssignment
    stage1_assignments = ReviewAssignment.objects.filter(
        proposal=proposal,
        stage=ReviewAssignment.Stage.STAGE_1,
        status=ReviewAssignment.Status.COMPLETED
    ).select_related('stage1_score')
    
    for i, assignment in enumerate(stage1_assignments, 1):
        story.append(Paragraph(f"<b>Reviewer {i}</b>", styles['Heading3']))
        
        try:
            score = assignment.stage1_score
            
            # Score table
            score_data = [
                ['Criteria', 'Score', 'Max'],
                ['Originality', str(score.originality_score), '15'],
                ['Clarity', str(score.clarity_score), '15'],
                ['Literature Review', str(score.literature_review_score), '15'],
                ['Methodology', str(score.methodology_score), '15'],
                ['Impact', str(score.impact_score), '15'],
                ['Publication Potential', str(score.publication_potential_score), '10'],
                ['Budget Appropriateness', str(score.budget_appropriateness_score), '10'],
                ['Timeline Practicality', str(score.timeline_practicality_score), '5'],
                ['Total', str(score.total_score), '100'],
                ['Percentage', f"{score.percentage_score}%", '-'],
            ]
            
            table = Table(score_data, colWidths=[2.5*inch, 1*inch, 0.75*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, -2), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 10))
            
            if score.narrative_comments:
                story.append(Paragraph(f"<b>Comments:</b>", styles['Normal']))
                story.append(Paragraph(_safe_text(score.narrative_comments), styles['Normal']))
            
        except ObjectDoesNotExist:
            story.append(Paragraph("Score data not available", styles['Normal']))
        except Exception:
            logger.exception("Unexpected error while rendering stage 1 score for assignment_id=%s", assignment.id)
            story.append(Paragraph("Score data not available", styles['Normal']))
        
        story.append(Spacer(1, 15))
    
    if not stage1_assignments.exists():
        story.append(Paragraph("No Stage 1 reviews completed yet.", styles['Normal']))
    
    # Stage 2 Reviews if applicable
    story.append(Spacer(1, 20))
    story.append(Paragraph("Stage 2 Reviews", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    stage2_assignments = ReviewAssignment.objects.filter(
        proposal=proposal,
        stage=ReviewAssignment.Stage.STAGE_2,
        status=ReviewAssignment.Status.COMPLETED
    ).select_related('stage2_review')
    
    for i, assignment in enumerate(stage2_assignments, 1):
        story.append(Paragraph(f"<b>Reviewer {i}</b>", styles['Heading3']))
        
        try:
            review = assignment.stage2_review
            story.append(Paragraph(f"<b>Concerns Addressed:</b> {_safe_text(review.get_concerns_addressed_display())}", styles['Normal']))
            story.append(Paragraph(f"<b>Recommendation:</b> {_safe_text(review.get_revised_recommendation_display())}", styles['Normal']))
            if review.revised_score is not None:
                story.append(Paragraph(f"<b>Revised Score:</b> {_safe_text(review.revised_score)}%", styles['Normal']))
            if review.comments:
                story.append(Paragraph(f"<b>Comments:</b>", styles['Normal']))
                story.append(Paragraph(_safe_text(review.comments), styles['Normal']))
        except ObjectDoesNotExist:
            story.append(Paragraph("Review data not available", styles['Normal']))
        except Exception:
            logger.exception("Unexpected error while rendering stage 2 review for assignment_id=%s", assignment.id)
            story.append(Paragraph("Review data not available", styles['Normal']))
        
        story.append(Spacer(1, 15))
    
    if not stage2_assignments.exists():
        story.append(Paragraph("No Stage 2 reviews completed yet.", styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        f"Generated on {timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')}",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_summary_report(cycle):
    """
    Generate a summary report for a grant cycle.
    
    Args:
        cycle: GrantCycle instance
        
    Returns:
        BytesIO buffer containing the PDF
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        buffer = io.BytesIO()
        buffer.write(b"Report generation requires reportlab.")
        buffer.seek(0)
        return buffer
    
    from proposals.models import Proposal
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    story.append(Paragraph("CTRG Grant Cycle Summary Report", styles['Heading1']))
    story.append(Paragraph(f"{_safe_text(cycle.name)} ({_safe_text(cycle.year)})", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    proposals = cycle.proposals.all()
    
    # Statistics
    stats = [
        ['Status', 'Count'],
        ['Total Proposals', proposals.count()],
        ['Submitted', proposals.filter(status=Proposal.Status.SUBMITTED).count()],
        ['Under Stage 1 Review', proposals.filter(status=Proposal.Status.UNDER_STAGE_1_REVIEW).count()],
        ['Stage 1 Rejected', proposals.filter(status=Proposal.Status.STAGE_1_REJECTED).count()],
        ['Tentatively Accepted', proposals.filter(status=Proposal.Status.TENTATIVELY_ACCEPTED).count()],
        ['Final Accepted', proposals.filter(status=Proposal.Status.FINAL_ACCEPTED).count()],
        ['Final Rejected', proposals.filter(status=Proposal.Status.FINAL_REJECTED).count()],
    ]
    
    table = Table(stats, colWidths=[3*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Generated on {timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')}",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
