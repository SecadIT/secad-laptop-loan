'use client';
import { useState } from 'react';

export default function Form1() {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const comments = String(formData.get("comments") ?? "");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          comments
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        setStatus('✅ Form submitted successfully!');
        form.reset();
      } else {
        setStatus(`❌ Error: ${result.error || 'Failed to submit'}`);
        console.error('Submission error:', result);
      }
    } catch (error) {
      setStatus('❌ Network error - check console');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Form 1</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-2 rounded"
          required
        />

        <textarea
          name="comments"
          placeholder="Comments"
          className="border p-2 rounded"
          required
        />

        <button 
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {status && (
          <div className={`p-3 rounded ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        )}
      </form>
    </main>
  );
}