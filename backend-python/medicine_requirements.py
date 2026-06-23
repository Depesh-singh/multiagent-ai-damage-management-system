"""
Situation-Based Medicine & Medical Supply Requirements
Provides hospitals with required supplies based on disaster type
"""

from typing import Dict, List
from dataclasses import dataclass

# ============================================
# DISASTER TYPES & MEDICINE REQUIREMENTS
# ============================================

DISASTER_MEDICINE_MAP = {
    "FIRE": {
        "priority": "CRITICAL",
        "description": "Burn injuries, smoke inhalation, trauma",
        "medicines": [
            {"name": "Silver Sulfadiazine Cream", "quantity_per_patient": 2, "unit": "tubes", "priority": "HIGH"},
            {"name": "Morphine/Pain Relief IV", "quantity_per_patient": 3, "unit": "vials", "priority": "HIGH"},
            {"name": "Saline IV Bags", "quantity_per_patient": 5, "unit": "bags", "priority": "CRITICAL"},
            {"name": "Oxygen Cylinders", "quantity_per_patient": 1, "unit": "cylinder", "priority": "CRITICAL"},
            {"name": "Bronchodilators", "quantity_per_patient": 2, "unit": "inhalers", "priority": "HIGH"},
            {"name": "Burn Dressings", "quantity_per_patient": 10, "unit": "pieces", "priority": "HIGH"},
            {"name": "Tetanus Toxoid", "quantity_per_patient": 1, "unit": "dose", "priority": "MEDIUM"},
            {"name": "Antibiotics (Ciprofloxacin)", "quantity_per_patient": 14, "unit": "tablets", "priority": "HIGH"},
        ],
        "equipment": [
            {"name": "Ventilators", "quantity": 2, "priority": "CRITICAL"},
            {"name": "Burn Beds", "quantity": 5, "priority": "HIGH"},
            {"name": "Pulse Oximeters", "quantity": 10, "priority": "HIGH"},
        ]
    },
    
    "FLOOD": {
        "priority": "HIGH",
        "description": "Waterborne diseases, hypothermia, drowning injuries",
        "medicines": [
            {"name": "ORS Packets", "quantity_per_patient": 10, "unit": "packets", "priority": "CRITICAL"},
            {"name": "Ciprofloxacin 500mg", "quantity_per_patient": 14, "unit": "tablets", "priority": "HIGH"},
            {"name": "Metronidazole", "quantity_per_patient": 21, "unit": "tablets", "priority": "HIGH"},
            {"name": "Chlorine Tablets (Water)", "quantity_per_patient": 50, "unit": "tablets", "priority": "MEDIUM"},
            {"name": "Anti-fungal Cream", "quantity_per_patient": 1, "unit": "tube", "priority": "MEDIUM"},
            {"name": "Leptospirosis Vaccine", "quantity_per_patient": 1, "unit": "dose", "priority": "HIGH"},
            {"name": "IV Fluids", "quantity_per_patient": 3, "unit": "bags", "priority": "HIGH"},
            {"name": "Anti-diarrheal Medication", "quantity_per_patient": 10, "unit": "tablets", "priority": "HIGH"},
        ],
        "equipment": [
            {"name": "Warming Blankets", "quantity": 20, "priority": "HIGH"},
            {"name": "Water Purification Units", "quantity": 2, "priority": "MEDIUM"},
        ]
    },
    
    "EARTHQUAKE": {
        "priority": "CRITICAL",
        "description": "Crush injuries, fractures, trauma, dust inhalation",
        "medicines": [
            {"name": "Morphine/Strong Painkillers", "quantity_per_patient": 5, "unit": "vials", "priority": "CRITICAL"},
            {"name": "Blood Units (O-)", "quantity_per_patient": 2, "unit": "units", "priority": "CRITICAL"},
            {"name": "Saline IV", "quantity_per_patient": 6, "unit": "bags", "priority": "CRITICAL"},
            {"name": "Mannitol (Crush Syndrome)", "quantity_per_patient": 4, "unit": "bottles", "priority": "CRITICAL"},
            {"name": "Tetanus Immunoglobulin", "quantity_per_patient": 1, "unit": "dose", "priority": "HIGH"},
            {"name": "Antibiotics IV", "quantity_per_patient": 7, "unit": "vials", "priority": "HIGH"},
            {"name": "Splints & Casts", "quantity_per_patient": 2, "unit": "sets", "priority": "HIGH"},
            {"name": "Surgical Sutures", "quantity_per_patient": 5, "unit": "packets", "priority": "HIGH"},
        ],
        "equipment": [
            {"name": "X-Ray Machines (Portable)", "quantity": 2, "priority": "CRITICAL"},
            {"name": "Surgical Kits", "quantity": 10, "priority": "CRITICAL"},
            {"name": "Dialysis Machines", "quantity": 2, "priority": "HIGH"},
            {"name": "Blood Bank Access", "quantity": 1, "priority": "CRITICAL"},
        ]
    },
    
    "ACCIDENT": {
        "priority": "HIGH",
        "description": "Trauma, bleeding, fractures, head injuries",
        "medicines": [
            {"name": "Blood Units (O-)", "quantity_per_patient": 3, "unit": "units", "priority": "CRITICAL"},
            {"name": "Tranexamic Acid", "quantity_per_patient": 2, "unit": "vials", "priority": "CRITICAL"},
            {"name": "Morphine/Painkillers", "quantity_per_patient": 4, "unit": "vials", "priority": "HIGH"},
            {"name": "Saline IV", "quantity_per_patient": 4, "unit": "bags", "priority": "HIGH"},
            {"name": "Tetanus Toxoid", "quantity_per_patient": 1, "unit": "dose", "priority": "MEDIUM"},
            {"name": "Surgical Sutures", "quantity_per_patient": 3, "unit": "packets", "priority": "HIGH"},
            {"name": "Antibiotics", "quantity_per_patient": 14, "unit": "tablets", "priority": "MEDIUM"},
            {"name": "Anti-inflammatory Drugs", "quantity_per_patient": 20, "unit": "tablets", "priority": "MEDIUM"},
        ],
        "equipment": [
            {"name": "CT Scanner Access", "quantity": 1, "priority": "CRITICAL"},
            {"name": "Operating Theater", "quantity": 2, "priority": "CRITICAL"},
            {"name": "Neck Collars", "quantity": 10, "priority": "HIGH"},
            {"name": "Spine Boards", "quantity": 5, "priority": "HIGH"},
        ]
    },
    
    "CHEMICAL_SPILL": {
        "priority": "CRITICAL",
        "description": "Chemical burns, inhalation, poisoning",
        "medicines": [
            {"name": "Atropine", "quantity_per_patient": 10, "unit": "vials", "priority": "CRITICAL"},
            {"name": "Pralidoxime", "quantity_per_patient": 5, "unit": "vials", "priority": "CRITICAL"},
            {"name": "Activated Charcoal", "quantity_per_patient": 2, "unit": "bottles", "priority": "HIGH"},
            {"name": "Calcium Gluconate", "quantity_per_patient": 4, "unit": "vials", "priority": "HIGH"},
            {"name": "Sodium Bicarbonate", "quantity_per_patient": 3, "unit": "vials", "priority": "MEDIUM"},
            {"name": "Oxygen", "quantity_per_patient": 2, "unit": "cylinders", "priority": "CRITICAL"},
            {"name": "Bronchodilators", "quantity_per_patient": 2, "unit": "inhalers", "priority": "HIGH"},
            {"name": "Eye Wash Solution", "quantity_per_patient": 2, "unit": "bottles", "priority": "HIGH"},
        ],
        "equipment": [
            {"name": "Decontamination Showers", "quantity": 2, "priority": "CRITICAL"},
            {"name": "Hazmat Suits (Staff)", "quantity": 20, "priority": "CRITICAL"},
            {"name": "Ventilators", "quantity": 5, "priority": "CRITICAL"},
        ]
    },
    
    "BUILDING_COLLAPSE": {
        "priority": "CRITICAL",
        "description": "Similar to earthquake - crush injuries, dust, trauma",
        "medicines": [
            {"name": "Morphine/Strong Painkillers", "quantity_per_patient": 5, "unit": "vials", "priority": "CRITICAL"},
            {"name": "Blood Units (O-)", "quantity_per_patient": 3, "unit": "units", "priority": "CRITICAL"},
            {"name": "Saline IV", "quantity_per_patient": 5, "unit": "bags", "priority": "CRITICAL"},
            {"name": "Mannitol", "quantity_per_patient": 4, "unit": "bottles", "priority": "CRITICAL"},
            {"name": "Tetanus Immunoglobulin", "quantity_per_patient": 1, "unit": "dose", "priority": "HIGH"},
            {"name": "Antibiotics IV", "quantity_per_patient": 7, "unit": "vials", "priority": "HIGH"},
        ],
        "equipment": [
            {"name": "Surgical Kits", "quantity": 10, "priority": "CRITICAL"},
            {"name": "X-Ray Portable", "quantity": 2, "priority": "HIGH"},
        ]
    }
}

# Default/Generic disaster requirements
DEFAULT_REQUIREMENTS = {
    "priority": "HIGH",
    "description": "General emergency requirements",
    "medicines": [
        {"name": "Saline IV", "quantity_per_patient": 3, "unit": "bags", "priority": "HIGH"},
        {"name": "Painkillers", "quantity_per_patient": 3, "unit": "vials", "priority": "HIGH"},
        {"name": "Bandages & Dressings", "quantity_per_patient": 5, "unit": "pieces", "priority": "MEDIUM"},
        {"name": "Antibiotics", "quantity_per_patient": 14, "unit": "tablets", "priority": "MEDIUM"},
        {"name": "Tetanus Toxoid", "quantity_per_patient": 1, "unit": "dose", "priority": "MEDIUM"},
    ],
    "equipment": [
        {"name": "First Aid Kits", "quantity": 10, "priority": "HIGH"},
        {"name": "Stretchers", "quantity": 5, "priority": "HIGH"},
    ]
}

def get_medicine_requirements(disaster_type: str, patient_count: int) -> Dict:
    """
    Get medicine requirements based on disaster type and patient count.
    
    Args:
        disaster_type: Type of disaster (FIRE, FLOOD, EARTHQUAKE, etc.)
        patient_count: Number of expected patients
    
    Returns:
        Dictionary with medicine requirements scaled to patient count
    """
    disaster_type = disaster_type.upper()
    
    # Get requirements for disaster type or use default
    requirements = DISASTER_MEDICINE_MAP.get(disaster_type, DEFAULT_REQUIREMENTS)
    
    # Scale medicines by patient count
    scaled_medicines = []
    for med in requirements["medicines"]:
        scaled_medicines.append({
            "name": med["name"],
            "required_quantity": med["quantity_per_patient"] * patient_count,
            "unit": med["unit"],
            "priority": med["priority"],
            "per_patient": med["quantity_per_patient"]
        })
    
    # Equipment doesn't scale linearly (base requirements)
    equipment = requirements.get("equipment", [])
    
    return {
        "disaster_type": disaster_type,
        "priority": requirements["priority"],
        "description": requirements["description"],
        "patient_count": patient_count,
        "medicines": scaled_medicines,
        "equipment": equipment,
        "critical_items": [m for m in scaled_medicines if m["priority"] == "CRITICAL"],
        "high_priority_items": [m for m in scaled_medicines if m["priority"] == "HIGH"]
    }

def get_hospital_preparation_checklist(disaster_type: str, patient_count: int, hospital_name: str) -> Dict:
    """
    Generate a preparation checklist for a specific hospital.
    """
    requirements = get_medicine_requirements(disaster_type, patient_count)
    
    checklist = {
        "hospital": hospital_name,
        "alert_level": requirements["priority"],
        "expected_patients": patient_count,
        "disaster_type": disaster_type,
        "immediate_actions": [],
        "medicine_checklist": [],
        "equipment_checklist": []
    }
    
    # Immediate actions based on priority
    if requirements["priority"] == "CRITICAL":
        checklist["immediate_actions"] = [
            "Activate Emergency Response Protocol",
            "Call in all off-duty medical staff",
            "Clear non-critical patients from Emergency ward",
            "Alert blood bank for emergency supply",
            "Prepare operating theaters",
            "Set up triage area"
        ]
    else:
        checklist["immediate_actions"] = [
            "Activate Emergency Response Protocol",
            "Prepare Emergency Department",
            "Stock up on required medicines",
            "Brief medical staff"
        ]
    
    # Medicine checklist with status
    for med in requirements["medicines"]:
        checklist["medicine_checklist"].append({
            "item": med["name"],
            "required": f"{med['required_quantity']} {med['unit']}",
            "priority": med["priority"],
            "status": "PENDING"  # Would be updated from actual inventory
        })
    
    # Equipment checklist
    for eq in requirements["equipment"]:
        checklist["equipment_checklist"].append({
            "item": eq["name"],
            "required": eq["quantity"],
            "priority": eq["priority"],
            "status": "PENDING"
        })
    
    return checklist

def get_all_disaster_types() -> List[str]:
    """Return list of all supported disaster types."""
    return list(DISASTER_MEDICINE_MAP.keys())

# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    import json
    
    print("=" * 50)
    print("Medicine Requirements Test")
    print("=" * 50)
    
    # Test FIRE disaster with 6 patients
    result = get_medicine_requirements("FIRE", 6)
    print(f"\nDisaster: FIRE, Patients: 6")
    print(f"Priority: {result['priority']}")
    print(f"\nCritical Items:")
    for item in result["critical_items"]:
        print(f"  - {item['name']}: {item['required_quantity']} {item['unit']}")
    
    print("\n" + "=" * 50)
    
    # Hospital checklist
    checklist = get_hospital_preparation_checklist("FIRE", 6, "City Hospital A")
    print(f"\nHospital Checklist for {checklist['hospital']}:")
    print(f"Alert Level: {checklist['alert_level']}")
    print(f"\nImmediate Actions:")
    for action in checklist["immediate_actions"]:
        print(f"  [ ] {action}")
