/**
 * Server-side keyword-based symptom rule engine.
 * Matches the same logic as the frontend's getLocalResult but returns
 * only the fields we persist (disease, recommendation, confidence).
 */
export function analyzeSymptoms(
  symptomText: string,
  severity: string,
  duration: string
): { disease: string; recommendation: string; confidence: number } {
  const text = symptomText.toLowerCase();
  const dur = duration.trim() || 'a short time';

  if (text.includes('breathing') || text.includes('shortness of breath')) {
    return {
      disease: 'Breathing Difficulty / Respiratory Issue',
      recommendation: 'Seek medical help quickly, especially if symptoms are getting worse.',
      confidence: 72,
    };
  }

  if (text.includes('fever') || text.includes('cold') || text.includes('cough')) {
    return {
      disease: 'Likely Viral / Flu-like Illness',
      recommendation:
        severity === 'severe'
          ? 'Consider a doctor visit soon, rest well, and monitor the fever closely.'
          : 'Rest, hydrate, and monitor symptoms. Book a doctor if it continues or worsens.',
      confidence: 66,
    };
  }

  if (text.includes('stomach') || text.includes('abdominal') || text.includes('vomit')) {
    return {
      disease: 'Digestive / Stomach Discomfort',
      recommendation: 'Keep meals light, drink water, and seek care if the pain is severe or persistent.',
      confidence: 63,
    };
  }

  if (text.includes('headache') || text.includes('dizziness') || text.includes('body pain')) {
    return {
      disease: 'General Aches / Possible Dehydration',
      recommendation: 'Rest, drink water, and track whether the symptoms improve over the next day.',
      confidence: 58,
    };
  }

  return {
    disease: 'Basic Symptom Summary',
    recommendation:
      'Track the symptoms, rest, hydrate, and book a doctor if they last more than 2-3 days or get worse.',
    confidence: 50,
  };
}
