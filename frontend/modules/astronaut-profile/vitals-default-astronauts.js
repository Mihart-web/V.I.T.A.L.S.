/* V.I.T.A.L.S. DEFAULT CREW SEED V2 - ALL HEALTH DATA SYNTHETIC. NOT REAL MEDICAL RECORDS. */
(()=>{
 "use strict";
 const KEY="vitals.astronauts.v1";
 const defaults=[
  {
    "astronautId": "VITALS-DEF-001",
    "fullName": "Stefano Pucci",
    "nationality": "Italy",
    "sex": "male",
    "age": 35,
    "height": 182,
    "weight": 82,
    "bloodType": "O+",
    "avatarIndex": 1,
    "avatarFile": "av1.png",
    "avatar": "av1.png",
    "physique": "Athletic",
    "accessibilitySupportScenario": "None specified",
    "protected": true,
    "isDefault": true,
    "recordType": "fictional-demo",
    "dataProvenance": "synthetic-simulation-not-clinical",
    "metricUnits": "as-in-field-names",
    "metrics": {
      "restingHeartRateBpm": 62,
      "heartRateVariabilityMs": 54,
      "systolicBpMmHg": 118,
      "diastolicBpMmHg": 76,
      "oxygenSaturationPct": 98,
      "respiratoryRatePerMin": 14,
      "bodyTemperatureC": 36.7,
      "skinTemperatureC": 33.1,
      "fastingGlucoseMgDl": 89,
      "hydrationEstimatePct": 60,
      "dailyWaterIntakeL": 2.5,
      "bloodOxygenAtRestPct": 98,
      "sleepDurationH": 7.2,
      "sleepEfficiencyPct": 87,
      "sleepLatencyMin": 16,
      "deepSleepPct": 20,
      "remSleepPct": 24,
      "sleepInterruptionsCount": 2,
      "circadianAlignmentScore": 86,
      "fatigueSelfReport10": 2,
      "stressSelfReport10": 3,
      "moodSelfReport10": 8,
      "isolationSelfReport10": 2,
      "motivationSelfReport10": 9,
      "socialConnectionSelfReport10": 8,
      "workloadSelfReport10": 5,
      "focusTaskAccuracyPct": 91,
      "memoryTaskAccuracyPct": 88,
      "reactionTaskAccuracyPct": 89,
      "reactionTimeMedianMs": 280,
      "flexibilityTaskAccuracyPct": 89,
      "categoryMatchAccuracyPct": 91,
      "reactionFalseStartsCount": 0,
      "balanceTestScorePct": 93,
      "gripStrengthKg": 46,
      "legStrengthBaselineN": 1510,
      "mobilityTestScorePct": 90,
      "exerciseMinutesPerDay": 50,
      "stepsPerDay": 8300,
      "calorieTargetKcal": 2550,
      "proteinTargetG": 112,
      "mealRegularityScorePct": 88,
      "boneDensityTScoreSimulation": 0.4,
      "muscleMassKgSimulation": 34.4,
      "bodyFatPctSimulation": 18.0,
      "cumulativeRadiationDoseMSvSimulation": 0,
      "skinHydrationPct": 58,
      "coreTemperatureTrendC": 36.7,
      "cognitiveReadinessProxyPct": 89,
      "selfReportedWellbeingProxyPct": 83,
      "missionWorkHoursPerDay": 8,
      "restBreaksPerShift": 3,
      "headacheSelfReport10": 1,
      "nauseaSelfReport10": 0,
      "vestibularAdaptationScorePct": 91,
      "manualDexterityScorePct": 92,
      "fineMotorErrorCount": 0
    },
    "simulationNotice": "SYNTHETIC MEDICAL DATA - DEMONSTRATION ONLY. Not real personal health records.",
    "clinicalHistory": {
      "summary": "Prior episodes of mechanical low-back discomfort; no current acute symptoms in this fictional scenario.",
      "conditions": [
        {
          "name": "Recurrent mechanical lower-back pain",
          "status": "Intermittent, resolved at baseline",
          "severity": "mild",
          "onset": "2022",
          "observations": "Monitor lifting tolerance, lumbar discomfort, and trunk endurance during EVA simulation"
        }
      ],
      "allergies": [
        {
          "substance": "No known allergies in synthetic scenario",
          "reaction": "Not applicable",
          "verification": "fictional; not a clinical assertion"
        }
      ],
      "medications": [
        {
          "name": "No scheduled medication",
          "dose": "Not applicable",
          "status": "Synthetic scenario"
        }
      ],
      "surgeries": [
        {
          "procedure": "No prior surgery specified",
          "date": null
        }
      ],
      "injuries": [
        "Resolved lower-back strain during training (fictional)"
      ],
      "familyHistory": "Not specified for synthetic dataset",
      "clinicalNotes": "Do not infer fitness for flight; no medication or EVA authorization implied.",
      "monitoringFocus": [
        "lumbar pain self-report",
        "leg strength",
        "trunk loading",
        "sleep recovery"
      ],
      "classification": "fictional-demo",
      "clinicalApproval": false,
      "medicalClearance": "not_assessed",
      "humanAuthorizationRequired": true
    },
    "clinicalConditions": [
      "Recurrent mechanical lower-back pain"
    ],
    "clinicalNotes": "Do not infer fitness for flight; no medication or EVA authorization implied.",
    "laboratoryBaselineSimulation": {
      "hemoglobinGdL": 15.2,
      "hematocritPct": 45,
      "whiteBloodCells109L": 6.1,
      "platelets109L": 245,
      "ferritinNgMl": 95,
      "creatinineMgDl": 0.93,
      "vitaminDNgMl": 34,
      "crpMgL": 0.8,
      "recordedAt": "2026-11-01",
      "provenance": "synthetic values for software testing"
    },
    "physiologicalBaselineRangesSimulation": {
      "heartRateBpm": {
        "min": 50,
        "max": 84
      },
      "systolicBPmmHg": {
        "min": 106,
        "max": 133
      },
      "diastolicBPmmHg": {
        "min": 66,
        "max": 88
      },
      "oxygenSaturationPct": {
        "min": 95,
        "max": 100
      },
      "respiratoryRatePerMin": {
        "min": 11,
        "max": 18
      }
    },
    "bodyCompositionSimulation": {
      "muscleMassKg": 34.4,
      "bodyFatPct": 18.0,
      "boneDensityTScore": 0.4,
      "legStrengthN": 1510,
      "referenceDate": "2026-11-01"
    },
    "observationsSimulation": [
      {
        "date": "2026-11-02",
        "restingHeartRateBpm": 60,
        "sleepDurationH": 7.4,
        "fatigueScore10": 1,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-04",
        "restingHeartRateBpm": 63,
        "sleepDurationH": 6.9,
        "fatigueScore10": 2,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-06",
        "restingHeartRateBpm": 62,
        "sleepDurationH": 7.2,
        "fatigueScore10": 2,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-08",
        "restingHeartRateBpm": 64,
        "sleepDurationH": 6.8,
        "fatigueScore10": 3,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-10",
        "restingHeartRateBpm": 61,
        "sleepDurationH": 7.5,
        "fatigueScore10": 2,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-12",
        "restingHeartRateBpm": 63,
        "sleepDurationH": 7.1,
        "fatigueScore10": 2,
        "type": "synthetic premission history"
      }
    ],
    "modelReadiness": {
      "clinicalSimulationOnly": true,
      "requiresEnvironmentalInput": true,
      "requiresMissionDuration": true,
      "requiresIndividualBaseline": true,
      "measuredData": false,
      "predictedOutcomesAvailable": false
    },
    "syntheticSchemaVersion": "vitals.defaults.synthetic.v2"
  },
  {
    "astronautId": "VITALS-DEF-002",
    "fullName": "Mihaela Vengher",
    "nationality": "Romania",
    "sex": "female",
    "age": 38,
    "height": 161,
    "weight": 52,
    "bloodType": "A-",
    "avatarIndex": 2,
    "avatarFile": "av2.webp",
    "avatar": "av2.webp",
    "physique": "Petite",
    "accessibilitySupportScenario": "None specified",
    "protected": true,
    "isDefault": true,
    "recordType": "fictional-demo",
    "dataProvenance": "synthetic-simulation-not-clinical",
    "metricUnits": "as-in-field-names",
    "metrics": {
      "restingHeartRateBpm": 70,
      "heartRateVariabilityMs": 47,
      "systolicBpMmHg": 108,
      "diastolicBpMmHg": 70,
      "oxygenSaturationPct": 99,
      "respiratoryRatePerMin": 15,
      "bodyTemperatureC": 36.5,
      "skinTemperatureC": 32.8,
      "fastingGlucoseMgDl": 85,
      "hydrationEstimatePct": 55,
      "dailyWaterIntakeL": 1.9,
      "bloodOxygenAtRestPct": 99,
      "sleepDurationH": 7.1,
      "sleepEfficiencyPct": 85,
      "sleepLatencyMin": 20,
      "deepSleepPct": 18,
      "remSleepPct": 22,
      "sleepInterruptionsCount": 2,
      "circadianAlignmentScore": 79,
      "fatigueSelfReport10": 4,
      "stressSelfReport10": 4,
      "moodSelfReport10": 7,
      "isolationSelfReport10": 3,
      "motivationSelfReport10": 9,
      "socialConnectionSelfReport10": 8,
      "workloadSelfReport10": 6,
      "focusTaskAccuracyPct": 92,
      "memoryTaskAccuracyPct": 94,
      "reactionTaskAccuracyPct": 88,
      "reactionTimeMedianMs": 305,
      "flexibilityTaskAccuracyPct": 90,
      "categoryMatchAccuracyPct": 93,
      "reactionFalseStartsCount": 1,
      "balanceTestScorePct": 87,
      "gripStrengthKg": 28,
      "legStrengthBaselineN": 950,
      "mobilityTestScorePct": 91,
      "exerciseMinutesPerDay": 38,
      "stepsPerDay": 6900,
      "calorieTargetKcal": 1950,
      "proteinTargetG": 75,
      "mealRegularityScorePct": 82,
      "boneDensityTScoreSimulation": -0.1,
      "muscleMassKgSimulation": 20.1,
      "bodyFatPctSimulation": 24.5,
      "cumulativeRadiationDoseMSvSimulation": 0,
      "skinHydrationPct": 52,
      "coreTemperatureTrendC": 36.5,
      "cognitiveReadinessProxyPct": 88,
      "selfReportedWellbeingProxyPct": 76,
      "missionWorkHoursPerDay": 7,
      "restBreaksPerShift": 4,
      "headacheSelfReport10": 1,
      "nauseaSelfReport10": 0,
      "vestibularAdaptationScorePct": 85,
      "manualDexterityScorePct": 94,
      "fineMotorErrorCount": 0
    },
    "simulationNotice": "SYNTHETIC MEDICAL DATA - DEMONSTRATION ONLY. Not real personal health records.",
    "clinicalHistory": {
      "summary": "Resolved iron-deficiency scenario; baseline hematology is documented for training only.",
      "conditions": [
        {
          "name": "Previous iron deficiency",
          "status": "Resolved; normal illustrative baseline",
          "severity": "historical",
          "onset": "2021",
          "observations": "Track simulated hemoglobin, fatigue and exercise tolerance; do not assume ongoing disease"
        }
      ],
      "allergies": [
        {
          "substance": "No known allergies in synthetic scenario",
          "reaction": "Not applicable",
          "verification": "fictional; not a clinical assertion"
        }
      ],
      "medications": [
        {
          "name": "No scheduled medication",
          "dose": "Not applicable",
          "status": "Synthetic scenario"
        }
      ],
      "surgeries": [
        {
          "procedure": "No surgery specified",
          "date": null
        }
      ],
      "injuries": [],
      "familyHistory": "Not specified for synthetic dataset",
      "clinicalNotes": "The medical history is invented and must not be associated with the real person.",
      "monitoringFocus": [
        "hemoglobin trend",
        "fatigue self-report",
        "sleep duration",
        "aerobic performance"
      ],
      "classification": "fictional-demo",
      "clinicalApproval": false,
      "medicalClearance": "not_assessed",
      "humanAuthorizationRequired": true
    },
    "clinicalConditions": [
      "Previous iron deficiency"
    ],
    "clinicalNotes": "The medical history is invented and must not be associated with the real person.",
    "laboratoryBaselineSimulation": {
      "hemoglobinGdL": 12.8,
      "hematocritPct": 38,
      "whiteBloodCells109L": 5.8,
      "platelets109L": 251,
      "ferritinNgMl": 31,
      "creatinineMgDl": 0.72,
      "vitaminDNgMl": 29,
      "crpMgL": 0.5,
      "recordedAt": "2026-11-01",
      "provenance": "synthetic values for software testing"
    },
    "physiologicalBaselineRangesSimulation": {
      "heartRateBpm": {
        "min": 58,
        "max": 92
      },
      "systolicBPmmHg": {
        "min": 96,
        "max": 123
      },
      "diastolicBPmmHg": {
        "min": 60,
        "max": 82
      },
      "oxygenSaturationPct": {
        "min": 95,
        "max": 100
      },
      "respiratoryRatePerMin": {
        "min": 12,
        "max": 19
      }
    },
    "bodyCompositionSimulation": {
      "muscleMassKg": 20.1,
      "bodyFatPct": 24.5,
      "boneDensityTScore": -0.1,
      "legStrengthN": 950,
      "referenceDate": "2026-11-01"
    },
    "observationsSimulation": [
      {
        "date": "2026-11-02",
        "restingHeartRateBpm": 68,
        "sleepDurationH": 7.3,
        "fatigueScore10": 3,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-04",
        "restingHeartRateBpm": 71,
        "sleepDurationH": 6.8,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-06",
        "restingHeartRateBpm": 70,
        "sleepDurationH": 7.1,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-08",
        "restingHeartRateBpm": 72,
        "sleepDurationH": 6.7,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-10",
        "restingHeartRateBpm": 69,
        "sleepDurationH": 7.4,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-12",
        "restingHeartRateBpm": 71,
        "sleepDurationH": 7.0,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      }
    ],
    "modelReadiness": {
      "clinicalSimulationOnly": true,
      "requiresEnvironmentalInput": true,
      "requiresMissionDuration": true,
      "requiresIndividualBaseline": true,
      "measuredData": false,
      "predictedOutcomesAvailable": false
    },
    "syntheticSchemaVersion": "vitals.defaults.synthetic.v2"
  },
  {
    "astronautId": "VITALS-DEF-003",
    "fullName": "Matteo Casavecchia",
    "nationality": "Italy",
    "sex": "male",
    "age": 37,
    "height": 174,
    "weight": 89,
    "bloodType": "B+",
    "avatarIndex": 3,
    "avatarFile": "av3.webp",
    "avatar": "av3.webp",
    "physique": "Broad build",
    "accessibilitySupportScenario": "Optional nutrition-accessibility support (fictional training scenario only)",
    "protected": true,
    "isDefault": true,
    "recordType": "fictional-demo",
    "dataProvenance": "synthetic-simulation-not-clinical",
    "metricUnits": "as-in-field-names",
    "metrics": {
      "restingHeartRateBpm": 76,
      "heartRateVariabilityMs": 39,
      "systolicBpMmHg": 124,
      "diastolicBpMmHg": 81,
      "oxygenSaturationPct": 97,
      "respiratoryRatePerMin": 17,
      "bodyTemperatureC": 36.7,
      "skinTemperatureC": 33.6,
      "fastingGlucoseMgDl": 96,
      "hydrationEstimatePct": 57,
      "dailyWaterIntakeL": 2.0,
      "bloodOxygenAtRestPct": 97,
      "sleepDurationH": 6.7,
      "sleepEfficiencyPct": 81,
      "sleepLatencyMin": 26,
      "deepSleepPct": 16,
      "remSleepPct": 21,
      "sleepInterruptionsCount": 3,
      "circadianAlignmentScore": 75,
      "fatigueSelfReport10": 4,
      "stressSelfReport10": 5,
      "moodSelfReport10": 7,
      "isolationSelfReport10": 3,
      "motivationSelfReport10": 8,
      "socialConnectionSelfReport10": 7,
      "workloadSelfReport10": 6,
      "focusTaskAccuracyPct": 84,
      "memoryTaskAccuracyPct": 83,
      "reactionTaskAccuracyPct": 81,
      "reactionTimeMedianMs": 355,
      "flexibilityTaskAccuracyPct": 82,
      "categoryMatchAccuracyPct": 85,
      "reactionFalseStartsCount": 1,
      "balanceTestScorePct": 84,
      "gripStrengthKg": 42,
      "legStrengthBaselineN": 1320,
      "mobilityTestScorePct": 84,
      "exerciseMinutesPerDay": 30,
      "stepsPerDay": 6200,
      "calorieTargetKcal": 2450,
      "proteinTargetG": 98,
      "mealRegularityScorePct": 76,
      "boneDensityTScoreSimulation": 0.2,
      "muscleMassKgSimulation": 31.2,
      "bodyFatPctSimulation": 27.8,
      "cumulativeRadiationDoseMSvSimulation": 0,
      "skinHydrationPct": 54,
      "coreTemperatureTrendC": 36.7,
      "cognitiveReadinessProxyPct": 82,
      "selfReportedWellbeingProxyPct": 73,
      "missionWorkHoursPerDay": 8,
      "restBreaksPerShift": 4,
      "headacheSelfReport10": 1,
      "nauseaSelfReport10": 0,
      "vestibularAdaptationScorePct": 86,
      "manualDexterityScorePct": 85,
      "fineMotorErrorCount": 1
    },
    "simulationNotice": "SYNTHETIC MEDICAL DATA - DEMONSTRATION ONLY. Not real personal health records.",
    "clinicalHistory": {
      "summary": "Mild intermittent exercise- and dust-triggered airway symptoms in the fictional training case.",
      "conditions": [
        {
          "name": "Intermittent reactive airway symptoms",
          "status": "Stable synthetic baseline",
          "severity": "mild",
          "onset": "2020",
          "observations": "Monitor respiratory rate, SpO2 and dust exposure; respiratory intervention requires authorized medical oversight"
        }
      ],
      "allergies": [
        {
          "substance": "Seasonal pollen (fictional)",
          "reaction": "Mild nasal irritation",
          "verification": "fictional test case"
        }
      ],
      "medications": [
        {
          "name": "Simulated reliever inhaler in inventory",
          "dose": "No dosing or administration protocol defined",
          "status": "Training reference only"
        }
      ],
      "surgeries": [
        {
          "procedure": "No prior surgery specified",
          "date": null
        }
      ],
      "injuries": [],
      "familyHistory": "Not specified for synthetic dataset",
      "clinicalNotes": "No evidence of a real diagnosis. Avoid automated treatment based on this flag.",
      "monitoringFocus": [
        "respiratory rate",
        "oxygen saturation",
        "particulate exposure",
        "exertional symptoms"
      ],
      "classification": "fictional-demo",
      "clinicalApproval": false,
      "medicalClearance": "not_assessed",
      "humanAuthorizationRequired": true
    },
    "clinicalConditions": [
      "Intermittent reactive airway symptoms"
    ],
    "clinicalNotes": "No evidence of a real diagnosis. Avoid automated treatment based on this flag.",
    "laboratoryBaselineSimulation": {
      "hemoglobinGdL": 14.9,
      "hematocritPct": 44,
      "whiteBloodCells109L": 6.7,
      "platelets109L": 265,
      "ferritinNgMl": 110,
      "creatinineMgDl": 1.01,
      "vitaminDNgMl": 27,
      "crpMgL": 1.2,
      "recordedAt": "2026-11-01",
      "provenance": "synthetic values for software testing"
    },
    "physiologicalBaselineRangesSimulation": {
      "heartRateBpm": {
        "min": 64,
        "max": 98
      },
      "systolicBPmmHg": {
        "min": 112,
        "max": 139
      },
      "diastolicBPmmHg": {
        "min": 71,
        "max": 93
      },
      "oxygenSaturationPct": {
        "min": 95,
        "max": 100
      },
      "respiratoryRatePerMin": {
        "min": 14,
        "max": 21
      }
    },
    "bodyCompositionSimulation": {
      "muscleMassKg": 31.2,
      "bodyFatPct": 27.8,
      "boneDensityTScore": 0.2,
      "legStrengthN": 1320,
      "referenceDate": "2026-11-01"
    },
    "observationsSimulation": [
      {
        "date": "2026-11-02",
        "restingHeartRateBpm": 74,
        "sleepDurationH": 6.9,
        "fatigueScore10": 3,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-04",
        "restingHeartRateBpm": 77,
        "sleepDurationH": 6.4,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-06",
        "restingHeartRateBpm": 76,
        "sleepDurationH": 6.7,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-08",
        "restingHeartRateBpm": 78,
        "sleepDurationH": 6.3,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-10",
        "restingHeartRateBpm": 75,
        "sleepDurationH": 7.0,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-12",
        "restingHeartRateBpm": 77,
        "sleepDurationH": 6.6,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      }
    ],
    "modelReadiness": {
      "clinicalSimulationOnly": true,
      "requiresEnvironmentalInput": true,
      "requiresMissionDuration": true,
      "requiresIndividualBaseline": true,
      "measuredData": false,
      "predictedOutcomesAvailable": false
    },
    "syntheticSchemaVersion": "vitals.defaults.synthetic.v2"
  },
  {
    "astronautId": "VITALS-DEF-004",
    "fullName": "Laura Banaseanu",
    "nationality": "Romania",
    "sex": "female",
    "age": 32,
    "height": 172,
    "weight": 65,
    "bloodType": "O-",
    "avatarIndex": 4,
    "avatarFile": "av4.webp",
    "avatar": "av4.webp",
    "physique": "Athletic",
    "accessibilitySupportScenario": "None specified",
    "protected": true,
    "isDefault": true,
    "recordType": "fictional-demo",
    "dataProvenance": "synthetic-simulation-not-clinical",
    "metricUnits": "as-in-field-names",
    "metrics": {
      "restingHeartRateBpm": 58,
      "heartRateVariabilityMs": 64,
      "systolicBpMmHg": 111,
      "diastolicBpMmHg": 72,
      "oxygenSaturationPct": 99,
      "respiratoryRatePerMin": 13,
      "bodyTemperatureC": 36.4,
      "skinTemperatureC": 32.6,
      "fastingGlucoseMgDl": 82,
      "hydrationEstimatePct": 60,
      "dailyWaterIntakeL": 2.4,
      "bloodOxygenAtRestPct": 99,
      "sleepDurationH": 8.0,
      "sleepEfficiencyPct": 93,
      "sleepLatencyMin": 12,
      "deepSleepPct": 23,
      "remSleepPct": 24,
      "sleepInterruptionsCount": 1,
      "circadianAlignmentScore": 91,
      "fatigueSelfReport10": 1,
      "stressSelfReport10": 2,
      "moodSelfReport10": 9,
      "isolationSelfReport10": 2,
      "motivationSelfReport10": 9,
      "socialConnectionSelfReport10": 9,
      "workloadSelfReport10": 5,
      "focusTaskAccuracyPct": 90,
      "memoryTaskAccuracyPct": 88,
      "reactionTaskAccuracyPct": 94,
      "reactionTimeMedianMs": 260,
      "flexibilityTaskAccuracyPct": 93,
      "categoryMatchAccuracyPct": 89,
      "reactionFalseStartsCount": 0,
      "balanceTestScorePct": 96,
      "gripStrengthKg": 33,
      "legStrengthBaselineN": 1290,
      "mobilityTestScorePct": 96,
      "exerciseMinutesPerDay": 75,
      "stepsPerDay": 11000,
      "calorieTargetKcal": 2200,
      "proteinTargetG": 112,
      "mealRegularityScorePct": 92,
      "boneDensityTScoreSimulation": 0.7,
      "muscleMassKgSimulation": 26.4,
      "bodyFatPctSimulation": 19.4,
      "cumulativeRadiationDoseMSvSimulation": 0,
      "skinHydrationPct": 61,
      "coreTemperatureTrendC": 36.4,
      "cognitiveReadinessProxyPct": 93,
      "selfReportedWellbeingProxyPct": 91,
      "missionWorkHoursPerDay": 8,
      "restBreaksPerShift": 3,
      "headacheSelfReport10": 0,
      "nauseaSelfReport10": 0,
      "vestibularAdaptationScorePct": 95,
      "manualDexterityScorePct": 91,
      "fineMotorErrorCount": 0
    },
    "simulationNotice": "SYNTHETIC MEDICAL DATA - DEMONSTRATION ONLY. Not real personal health records.",
    "clinicalHistory": {
      "summary": "Recovered knee sprain scenario in an otherwise active synthetic athlete profile.",
      "conditions": [
        {
          "name": "Resolved knee ligament sprain",
          "status": "Recovered; observe during high-load simulation",
          "severity": "historical",
          "onset": "2023",
          "observations": "Compare knee mobility, single-leg balance and leg-force trend in partial gravity"
        }
      ],
      "allergies": [
        {
          "substance": "No known allergies in synthetic scenario",
          "reaction": "Not applicable",
          "verification": "fictional; not a clinical assertion"
        }
      ],
      "medications": [
        {
          "name": "No scheduled medication",
          "dose": "Not applicable",
          "status": "Synthetic scenario"
        }
      ],
      "surgeries": [
        {
          "procedure": "No prior surgery specified",
          "date": null
        }
      ],
      "injuries": [
        "Resolved right knee sprain (fictional)"
      ],
      "familyHistory": "Not specified for synthetic dataset",
      "clinicalNotes": "High baseline fitness does not establish medical clearance.",
      "monitoringFocus": [
        "balance",
        "joint mobility",
        "leg strength",
        "muscle recovery"
      ],
      "classification": "fictional-demo",
      "clinicalApproval": false,
      "medicalClearance": "not_assessed",
      "humanAuthorizationRequired": true
    },
    "clinicalConditions": [
      "Resolved knee ligament sprain"
    ],
    "clinicalNotes": "High baseline fitness does not establish medical clearance.",
    "laboratoryBaselineSimulation": {
      "hemoglobinGdL": 13.9,
      "hematocritPct": 41,
      "whiteBloodCells109L": 5.4,
      "platelets109L": 232,
      "ferritinNgMl": 62,
      "creatinineMgDl": 0.81,
      "vitaminDNgMl": 37,
      "crpMgL": 0.6,
      "recordedAt": "2026-11-01",
      "provenance": "synthetic values for software testing"
    },
    "physiologicalBaselineRangesSimulation": {
      "heartRateBpm": {
        "min": 46,
        "max": 80
      },
      "systolicBPmmHg": {
        "min": 99,
        "max": 126
      },
      "diastolicBPmmHg": {
        "min": 62,
        "max": 84
      },
      "oxygenSaturationPct": {
        "min": 95,
        "max": 100
      },
      "respiratoryRatePerMin": {
        "min": 10,
        "max": 17
      }
    },
    "bodyCompositionSimulation": {
      "muscleMassKg": 26.4,
      "bodyFatPct": 19.4,
      "boneDensityTScore": 0.7,
      "legStrengthN": 1290,
      "referenceDate": "2026-11-01"
    },
    "observationsSimulation": [
      {
        "date": "2026-11-02",
        "restingHeartRateBpm": 56,
        "sleepDurationH": 8.2,
        "fatigueScore10": 0,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-04",
        "restingHeartRateBpm": 59,
        "sleepDurationH": 7.7,
        "fatigueScore10": 1,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-06",
        "restingHeartRateBpm": 58,
        "sleepDurationH": 8.0,
        "fatigueScore10": 1,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-08",
        "restingHeartRateBpm": 60,
        "sleepDurationH": 7.6,
        "fatigueScore10": 2,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-10",
        "restingHeartRateBpm": 57,
        "sleepDurationH": 8.3,
        "fatigueScore10": 1,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-12",
        "restingHeartRateBpm": 59,
        "sleepDurationH": 7.9,
        "fatigueScore10": 1,
        "type": "synthetic premission history"
      }
    ],
    "modelReadiness": {
      "clinicalSimulationOnly": true,
      "requiresEnvironmentalInput": true,
      "requiresMissionDuration": true,
      "requiresIndividualBaseline": true,
      "measuredData": false,
      "predictedOutcomesAvailable": false
    },
    "syntheticSchemaVersion": "vitals.defaults.synthetic.v2"
  },
  {
    "astronautId": "VITALS-DEF-005",
    "fullName": "Andrea Caporicci",
    "nationality": "Italy",
    "sex": "male",
    "age": 55,
    "height": 169,
    "weight": 94,
    "bloodType": "AB+",
    "avatarIndex": 5,
    "avatarFile": "av5.webp",
    "avatar": "av5.webp",
    "physique": "Stocky",
    "accessibilitySupportScenario": "None specified",
    "protected": true,
    "isDefault": true,
    "recordType": "fictional-demo",
    "dataProvenance": "synthetic-simulation-not-clinical",
    "metricUnits": "as-in-field-names",
    "metrics": {
      "restingHeartRateBpm": 72,
      "heartRateVariabilityMs": 36,
      "systolicBpMmHg": 129,
      "diastolicBpMmHg": 82,
      "oxygenSaturationPct": 97,
      "respiratoryRatePerMin": 16,
      "bodyTemperatureC": 36.6,
      "skinTemperatureC": 33.4,
      "fastingGlucoseMgDl": 103,
      "hydrationEstimatePct": 54,
      "dailyWaterIntakeL": 2.0,
      "bloodOxygenAtRestPct": 97,
      "sleepDurationH": 6.6,
      "sleepEfficiencyPct": 78,
      "sleepLatencyMin": 28,
      "deepSleepPct": 15,
      "remSleepPct": 20,
      "sleepInterruptionsCount": 4,
      "circadianAlignmentScore": 71,
      "fatigueSelfReport10": 5,
      "stressSelfReport10": 5,
      "moodSelfReport10": 6,
      "isolationSelfReport10": 4,
      "motivationSelfReport10": 8,
      "socialConnectionSelfReport10": 8,
      "workloadSelfReport10": 6,
      "focusTaskAccuracyPct": 84,
      "memoryTaskAccuracyPct": 81,
      "reactionTaskAccuracyPct": 82,
      "reactionTimeMedianMs": 380,
      "flexibilityTaskAccuracyPct": 79,
      "categoryMatchAccuracyPct": 84,
      "reactionFalseStartsCount": 2,
      "balanceTestScorePct": 81,
      "gripStrengthKg": 43,
      "legStrengthBaselineN": 1170,
      "mobilityTestScorePct": 78,
      "exerciseMinutesPerDay": 25,
      "stepsPerDay": 5500,
      "calorieTargetKcal": 2350,
      "proteinTargetG": 100,
      "mealRegularityScorePct": 78,
      "boneDensityTScoreSimulation": -0.4,
      "muscleMassKgSimulation": 28.7,
      "bodyFatPctSimulation": 29.2,
      "cumulativeRadiationDoseMSvSimulation": 0,
      "skinHydrationPct": 50,
      "coreTemperatureTrendC": 36.6,
      "cognitiveReadinessProxyPct": 79,
      "selfReportedWellbeingProxyPct": 70,
      "missionWorkHoursPerDay": 7,
      "restBreaksPerShift": 4,
      "headacheSelfReport10": 3,
      "nauseaSelfReport10": 1,
      "vestibularAdaptationScorePct": 79,
      "manualDexterityScorePct": 86,
      "fineMotorErrorCount": 1
    },
    "simulationNotice": "SYNTHETIC MEDICAL DATA - DEMONSTRATION ONLY. Not real personal health records.",
    "clinicalHistory": {
      "summary": "Episodic headache and sleep disruption scenario for operational stress testing.",
      "conditions": [
        {
          "name": "Episodic migraine-like headaches",
          "status": "Intermittent synthetic history",
          "severity": "mild to moderate",
          "onset": "2019",
          "observations": "Monitor headaches, sleep and circadian adaptation; symptoms are illustrative, not diagnostic"
        }
      ],
      "allergies": [
        {
          "substance": "No known allergies in synthetic scenario",
          "reaction": "Not applicable",
          "verification": "fictional; not a clinical assertion"
        }
      ],
      "medications": [
        {
          "name": "No scheduled medication",
          "dose": "Not applicable",
          "status": "Synthetic scenario"
        }
      ],
      "surgeries": [
        {
          "procedure": "No prior surgery specified",
          "date": null
        }
      ],
      "injuries": [],
      "familyHistory": "Not specified for synthetic dataset",
      "clinicalNotes": "Do not assign medications or make fitness decisions from fictional data.",
      "monitoringFocus": [
        "sleep efficiency",
        "headache score",
        "stress self-report",
        "circadian alignment"
      ],
      "classification": "fictional-demo",
      "clinicalApproval": false,
      "medicalClearance": "not_assessed",
      "humanAuthorizationRequired": true
    },
    "clinicalConditions": [
      "Episodic migraine-like headaches"
    ],
    "clinicalNotes": "Do not assign medications or make fitness decisions from fictional data.",
    "laboratoryBaselineSimulation": {
      "hemoglobinGdL": 14.6,
      "hematocritPct": 43,
      "whiteBloodCells109L": 6.5,
      "platelets109L": 238,
      "ferritinNgMl": 88,
      "creatinineMgDl": 1.04,
      "vitaminDNgMl": 25,
      "crpMgL": 1.4,
      "recordedAt": "2026-11-01",
      "provenance": "synthetic values for software testing"
    },
    "physiologicalBaselineRangesSimulation": {
      "heartRateBpm": {
        "min": 60,
        "max": 94
      },
      "systolicBPmmHg": {
        "min": 117,
        "max": 144
      },
      "diastolicBPmmHg": {
        "min": 72,
        "max": 94
      },
      "oxygenSaturationPct": {
        "min": 95,
        "max": 100
      },
      "respiratoryRatePerMin": {
        "min": 13,
        "max": 20
      }
    },
    "bodyCompositionSimulation": {
      "muscleMassKg": 28.7,
      "bodyFatPct": 29.2,
      "boneDensityTScore": -0.4,
      "legStrengthN": 1170,
      "referenceDate": "2026-11-01"
    },
    "observationsSimulation": [
      {
        "date": "2026-11-02",
        "restingHeartRateBpm": 70,
        "sleepDurationH": 6.8,
        "fatigueScore10": 4,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-04",
        "restingHeartRateBpm": 73,
        "sleepDurationH": 6.3,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-06",
        "restingHeartRateBpm": 72,
        "sleepDurationH": 6.6,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-08",
        "restingHeartRateBpm": 74,
        "sleepDurationH": 6.2,
        "fatigueScore10": 6,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-10",
        "restingHeartRateBpm": 71,
        "sleepDurationH": 6.9,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      },
      {
        "date": "2026-11-12",
        "restingHeartRateBpm": 73,
        "sleepDurationH": 6.5,
        "fatigueScore10": 5,
        "type": "synthetic premission history"
      }
    ],
    "modelReadiness": {
      "clinicalSimulationOnly": true,
      "requiresEnvironmentalInput": true,
      "requiresMissionDuration": true,
      "requiresIndividualBaseline": true,
      "measuredData": false,
      "predictedOutcomesAvailable": false
    },
    "syntheticSchemaVersion": "vitals.defaults.synthetic.v2"
  }
];
 const ids=new Set(defaults.map(p=>p.astronautId));
 try {
   const raw=localStorage.getItem(KEY);
   const parsed=raw===null?[]:JSON.parse(raw);
   if(!Array.isArray(parsed)) {console.error("VITALS defaults: existing profile storage is not an array; no changes made.");return;}
   // Reserve the five default IDs. Recover protected entries on every page load.
   const custom=parsed.filter(p=>p && typeof p==="object" && !ids.has(String(p.astronautId??p.id??"").trim()));
   const updated=[...defaults,...custom];
   if(JSON.stringify(updated)!==JSON.stringify(parsed)) localStorage.setItem(KEY,JSON.stringify(updated));
 } catch(err) {console.error("VITALS defaults not loaded; prior profiles untouched",err);return;}
 // The create form cannot overwrite or impersonate a protected default ID.
 document.addEventListener("submit",event=>{
   if(event.target?.id!=="astronautForm")return;
   const id=String(event.target.elements.namedItem("astronautId")?.value??"").trim();
   if(!ids.has(id))return;
   event.preventDefault();event.stopImmediatePropagation();
   const status=document.getElementById("saveStatus");
   if(status)status.textContent="PROTECTED DEFAULT ASTRONAUT ID - CREATE A NEW ID";
 },true);
})();
