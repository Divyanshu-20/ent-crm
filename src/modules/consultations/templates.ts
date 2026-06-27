export type ConsultationTemplate = {
  id: string;
  label: string;
  chief_complaint: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
};

export const consultationTemplates: ConsultationTemplate[] = [
  {
    id: "allergic_rhinitis",
    label: "Allergic Rhinitis",
    chief_complaint:
      "Nasal congestion, sneezing, watery rhinorrhoea, and itchy eyes; worse on exposure to dust/pollen.",
    examination_findings:
      "Pale, boggy nasal mucosa with bilateral inferior turbinate hypertrophy. Clear watery secretions. Allergic shiners noted. Postnasal drip present. Throat unremarkable. Ears: TM intact bilaterally.",
    diagnosis: "Allergic rhinitis (perennial / seasonal)",
    treatment_plan:
      "1. Allergen avoidance counselling (dust mite, pollen, pets).\n2. Intranasal corticosteroid spray, 2 puffs each nostril once daily x 4 weeks.\n3. Oral non-sedating antihistamine once daily as needed.\n4. Saline nasal douche twice daily.\n5. Review in 4 weeks; consider immunotherapy work-up if persistent.",
  },
  {
    id: "acute_sinusitis",
    label: "Acute Sinusitis",
    chief_complaint:
      "Facial pain/pressure, purulent nasal discharge, nasal blockage, and fever for less than 4 weeks.",
    examination_findings:
      "Tenderness over maxillary/frontal sinuses. Mucopurulent discharge in middle meatus on anterior rhinoscopy. Erythematous nasal mucosa. Postnasal drip. Oropharynx: mild congestion.",
    diagnosis: "Acute bacterial rhinosinusitis",
    treatment_plan:
      "1. Amoxicillin-clavulanate 625 mg TDS x 7 days (or as per allergy profile).\n2. Intranasal corticosteroid spray BD.\n3. Saline nasal irrigation QID.\n4. Analgesic (paracetamol) PRN.\n5. Adequate hydration and steam inhalation.\n6. Review in 10 days; CT PNS if no improvement.",
  },
  {
    id: "chronic_sinusitis",
    label: "Chronic Sinusitis",
    chief_complaint:
      "Persistent nasal obstruction, postnasal drip, facial fullness, and hyposmia for >12 weeks.",
    examination_findings:
      "Bilateral inferior turbinate hypertrophy. Mucopurulent discharge in middle meatus. ± Nasal polyps. Postnasal drip. Reduced smell on bedside testing.",
    diagnosis: "Chronic rhinosinusitis (with / without nasal polyposis)",
    treatment_plan:
      "1. CT PNS (coronal cuts) to assess extent.\n2. Intranasal corticosteroid spray BD long-term.\n3. Saline nasal douche BD.\n4. Short course of oral steroids if polyposis (as per protocol).\n5. Culture-directed antibiotic if active infection.\n6. Discuss FESS if medical therapy fails after 8–12 weeks.",
  },
  {
    id: "otitis_media",
    label: "Otitis Media",
    chief_complaint:
      "Ear pain, reduced hearing, ± fever; recent upper respiratory infection.",
    examination_findings:
      "Otoscopy: bulging, erythematous tympanic membrane with loss of light reflex. ± Middle ear effusion. No perforation. Tuning fork: conductive hearing loss on affected side. Nasal mucosa congested.",
    diagnosis: "Acute otitis media",
    treatment_plan:
      "1. Amoxicillin 500 mg TDS x 5–7 days (or as per allergy).\n2. Analgesic (paracetamol/ibuprofen) PRN.\n3. Topical decongestant nasal drops x 3–5 days.\n4. Keep ear dry; no self-syringing.\n5. Review in 1 week; PTA / tympanometry if hearing not restored.",
  },
  {
    id: "otitis_externa",
    label: "Otitis Externa",
    chief_complaint:
      "Ear pain, itching, discharge, and tenderness on touching the pinna.",
    examination_findings:
      "Tragal tenderness positive. External auditory canal: oedematous, erythematous, with debris/discharge. Tympanic membrane intact where visible. No mastoid tenderness.",
    diagnosis: "Acute diffuse otitis externa",
    treatment_plan:
      "1. Aural toilet / microsuction in clinic.\n2. Topical antibiotic-steroid ear drops (ciprofloxacin + dexamethasone) 4 drops TDS x 7 days.\n3. Strict water precautions.\n4. Oral analgesic PRN.\n5. Avoid cotton buds.\n6. Review in 7 days.",
  },
  {
    id: "pharyngitis",
    label: "Pharyngitis",
    chief_complaint:
      "Sore throat, painful swallowing, ± low-grade fever.",
    examination_findings:
      "Oropharynx: erythematous mucosa, congested posterior pharyngeal wall, ± lymphoid hyperplasia. Tonsils not enlarged / no exudate. No cervical lymphadenopathy. Ears and nose unremarkable.",
    diagnosis: "Acute pharyngitis (likely viral)",
    treatment_plan:
      "1. Supportive: warm saline gargles QID, hydration, voice rest.\n2. Paracetamol PRN.\n3. Lozenges as needed.\n4. Antibiotic only if Centor criteria suggest streptococcal infection.\n5. Review if symptoms persist beyond 7 days.",
  },
  {
    id: "tonsillitis",
    label: "Tonsillitis",
    chief_complaint:
      "Severe sore throat, odynophagia, fever, and malaise.",
    examination_findings:
      "Tonsils grade 3 enlarged, erythematous with exudate. Uvula central. Tender bilateral jugulodigastric lymphadenopathy. No trismus or drooling. Airway patent.",
    diagnosis: "Acute follicular tonsillitis",
    treatment_plan:
      "1. Phenoxymethylpenicillin / amoxicillin x 7–10 days (or macrolide if allergic).\n2. Paracetamol / ibuprofen for pain and fever.\n3. Warm saline gargles QID.\n4. Adequate hydration and soft diet.\n5. Counsel on red flags (drooling, trismus, neck swelling).\n6. Discuss tonsillectomy if recurrent (Paradise criteria).",
  },
];
