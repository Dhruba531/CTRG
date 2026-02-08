import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CRITERIA = [
    "Scientific Merit", "Methodology", "Feasibility", "Budget justification",
    "Timeline", "Impact", "Innovation", "Investigator qualifications"
];

const ReviewForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [totalScore, setTotalScore] = useState(0);

    const formik = useFormik({
        initialValues: {
            scores: Array(8).fill(0),
            comments: '',
        },
        validationSchema: Yup.object({
            scores: Yup.array().of(Yup.number().min(1).max(10).required()),
            comments: Yup.string().required('Comments are required'),
        }),
        onSubmit: (values) => {
            alert('Review Submitted: ' + JSON.stringify(values));
            navigate('/reviewer/dashboard');
        },
    });

    // Auto-calculate total score
    useEffect(() => {
        const total = formik.values.scores.reduce((acc, curr) => acc + Number(curr), 0);
        setTotalScore(total);
    }, [formik.values.scores]);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Stage 1 Evaluation</h2>
            <p className="text-gray-500 mb-6">Proposal ID: {id}</p>

            <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {CRITERIA.map((criterion, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md border">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {index + 1}. {criterion} (1-10)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                {...formik.getFieldProps(`scores[${index}]`)}
                            />
                        </div>
                    ))}
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-md flex justify-between items-center">
                    <span className="font-bold text-lg text-blue-800">Total Score:</span>
                    <span className="text-2xl font-bold text-blue-900">{totalScore} / 80</span>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Comments</label>
                    <textarea
                        rows={4}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        {...formik.getFieldProps('comments')}
                    />
                    {formik.touched.comments && formik.errors.comments ? (
                        <div className="text-red-500 text-sm mt-1">{formik.errors.comments}</div>
                    ) : null}
                </div>

                <div className="flex justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-800">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-sm">
                        Submit Evaluation
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
