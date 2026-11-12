const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');

const seedDatabase = async () => {
  try {
    console.log('[Seeding] Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Medicine.deleteMany({}),
      MedicineBatch.deleteMany({}),
      Prescription.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Delivery.deleteMany({})
    ]);

    console.log('[Seeding] Creating demo users...');
    const [admin, pharmacist, customer, deliveryPartner, customer2] = await User.create([
      {
        name: 'Dr. Evelyn Reed (Chief Administrator)',
        email: 'admin@medipharm.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 98765 43210',
        address: { street: '10 Corporate Blvd', city: 'Hyderabad', state: 'Telangana', zipCode: '500081' }
      },
      {
        name: 'Pharm. Rajesh Sharma (Lead Pharmacist)',
        email: 'pharmacist@medipharm.com',
        password: 'Pharma@123',
        role: 'pharmacist',
        phone: '+91 98111 22334',
        address: { street: '45 Health Ave', city: 'Hyderabad', state: 'Telangana', zipCode: '500032' }
      },
      {
        name: 'Ananya Verma (Loyal Customer)',
        email: 'customer@medipharm.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+91 98222 33445',
        address: { street: 'A-204 Green Meadows, Hitec City', city: 'Hyderabad', state: 'Telangana', zipCode: '500081' }
      },
      {
        name: 'Vikram Singh (Express Delivery)',
        email: 'delivery@medipharm.com',
        password: 'Delivery@123',
        role: 'delivery',
        phone: '+91 98333 44556',
        address: { street: '12 Logistics Hub, Madhapur', city: 'Hyderabad', state: 'Telangana', zipCode: '500081' }
      },
      {
        name: 'Rohit Kulkarni',
        email: 'rohit.kulkarni@gmail.com',
        password: 'Customer@123',
        role: 'customer',
        phone: '+91 98444 55667',
        address: { street: 'Flat 302, Lakeview Enclave, Gachibowli', city: 'Hyderabad', state: 'Telangana', zipCode: '500032' }
      }
    ]);

    console.log('[Seeding] Creating categories...');
    const categories = await Category.create([
      { name: 'Antibiotics & Anti-infectives', description: 'Bacterial and microbial infection treatments', icon: 'ShieldAlert' },
      { name: 'Pain Relief & Fever', description: 'Analgesics, antipyretics and anti-inflammatory', icon: 'Activity' },
      { name: 'Cardiovascular & Hypertension', description: 'Heart health, blood pressure and statins', icon: 'HeartPulse' },
      { name: 'Diabetes Care', description: 'Blood sugar regulation and monitoring', icon: 'Droplets' },
      { name: 'Respiratory & Anti-Allergy', description: 'Asthma, cough, antihistamines and inhalers', icon: 'Wind' },
      { name: 'Vitamins & Health Supplements', description: 'Immunity, multivitamin and mineral support', icon: 'Sun' },
      { name: 'Gastrointestinal & Digestion', description: 'Antacids, PPIs, digestive enzymes and probiotics', icon: 'ShieldCheck' },
      { name: 'Dermatological & Skin Care', description: 'Topical treatments, antifungal and healing creams', icon: 'Sparkles' }
    ]);

    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });

    console.log('[Seeding] Creating medicines...');
    const medicineDefs = [
      {
        name: 'Augmentin 625 Duo Tablet',
        genericName: 'Amoxicillin & Potassium Clavulanate (500mg/125mg)',
        brand: 'GlaxoSmithKline',
        category: catMap['Antibiotics & Anti-infectives'],
        description: 'Potent broad-spectrum antibiotic indicated for severe respiratory, ENT, skin and soft tissue bacterial infections.',
        price: 215.50,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '625 mg',
        manufacturer: 'GSK Pharmaceuticals Ltd.',
        sideEffects: 'Nausea, mild diarrhea, abdominal discomfort.',
        storageInstructions: 'Store below 25°C in a dry place. Protect from moisture.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 30
      },
      {
        name: 'Azithral 500mg Tablet',
        genericName: 'Azithromycin (500mg)',
        brand: 'Alembic',
        category: catMap['Antibiotics & Anti-infectives'],
        description: 'Macrolide antibiotic used for respiratory tract infections, pneumonia, pharyngitis and tonsillitis.',
        price: 132.00,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '500 mg',
        manufacturer: 'Alembic Pharmaceuticals',
        sideEffects: 'Headache, dizziness, transient gastrointestinal disturbance.',
        storageInstructions: 'Store at room temperature away from direct sunlight.',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 25
      },
      {
        name: 'Dolo 650 Tablet',
        genericName: 'Paracetamol / Acetaminophen (650mg)',
        brand: 'Micro Labs',
        category: catMap['Pain Relief & Fever'],
        description: 'Gold standard antipyretic and analgesic for prompt relief of fever, headache, body aches, and post-vaccination fever.',
        price: 32.50,
        prescriptionRequired: false,
        dosageForm: 'Tablet',
        strength: '650 mg',
        manufacturer: 'Micro Labs Ltd.',
        sideEffects: 'Generally very safe when used as directed. Do not exceed 4g daily.',
        storageInstructions: 'Store in a dry location below 30°C.',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 50
      },
      {
        name: 'Combiflam Tablet',
        genericName: 'Ibuprofen (400mg) + Paracetamol (325mg)',
        brand: 'Sanofi',
        category: catMap['Pain Relief & Fever'],
        description: 'Dual-action NSAID and analgesic for dental pain, muscular strain, arthritis flare-ups, and painful inflammation.',
        price: 48.00,
        prescriptionRequired: false,
        dosageForm: 'Tablet',
        strength: '725 mg',
        manufacturer: 'Sanofi India Ltd.',
        sideEffects: 'Heartburn, mild gastric irritation; take strictly after meals.',
        storageInstructions: 'Keep blister pack tightly sealed in a cool location.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 35
      },
      {
        name: 'Telma 40mg Tablet',
        genericName: 'Telmisartan (40mg)',
        brand: 'Glenmark',
        category: catMap['Cardiovascular & Hypertension'],
        description: 'Angiotensin II Receptor Blocker (ARB) prescribed for long-term management of essential hypertension and cardiovascular risk reduction.',
        price: 198.00,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '40 mg',
        manufacturer: 'Glenmark Pharmaceuticals',
        sideEffects: 'Dizziness, mild hypotension upon standing suddenly.',
        storageInstructions: 'Protect from light and moisture.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 20
      },
      {
        name: 'Atorva 20mg Tablet',
        genericName: 'Atorvastatin (20mg)',
        brand: 'Zydus Cadila',
        category: catMap['Cardiovascular & Hypertension'],
        description: 'HMG-CoA reductase inhibitor (statin) used to lower LDL bad cholesterol, triglycerides and prevent arterial plaque build-up.',
        price: 245.00,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '20 mg',
        manufacturer: 'Zydus Healthcare',
        sideEffects: 'Mild muscle ache, fatigue.',
        storageInstructions: 'Store below 25°C.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 20
      },
      {
        name: 'Glycomet-GP 2 Tablet',
        genericName: 'Glimepiride (2mg) + Metformin Hydrochloride (500mg PR)',
        brand: 'USV Pharma',
        category: catMap['Diabetes Care'],
        description: 'Advanced oral antidiabetic therapy for glycemic control in adult Type 2 Diabetes Mellitus.',
        price: 185.00,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '502 mg',
        manufacturer: 'USV Private Limited',
        sideEffects: 'Hypoglycemia if skipped meals, metallic taste.',
        storageInstructions: 'Store in cool place protected from humidity.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 25
      },
      {
        name: 'OneTouch Select Plus Test Strips (50s)',
        genericName: 'Blood Glucose Test Strips',
        brand: 'LifeScan',
        category: catMap['Diabetes Care'],
        description: 'Precision quantitative blood glucose test strips for diabetic monitoring with 5-second fast results.',
        price: 990.00,
        prescriptionRequired: false,
        dosageForm: 'Drops',
        strength: '50 Strips',
        manufacturer: 'LifeScan Inc.',
        sideEffects: 'None. For in-vitro diagnostic self-testing.',
        storageInstructions: 'Keep vial tightly capped. Do not refrigerate.',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 15
      },
      {
        name: 'Montair-LC Tablet',
        genericName: 'Montelukast Sodium (10mg) + Levocetirizine (5mg)',
        brand: 'Cipla',
        category: catMap['Respiratory & Anti-Allergy'],
        description: 'Comprehensive antihistamine and leukotriene receptor antagonist for allergic rhinitis, sneezing, and chronic asthma prophylaxis.',
        price: 210.00,
        prescriptionRequired: true,
        dosageForm: 'Tablet',
        strength: '15 mg',
        manufacturer: 'Cipla Ltd.',
        sideEffects: 'Mild drowsiness, dry mouth, tiredness.',
        storageInstructions: 'Store below 25°C in dry conditions.',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 20
      },
      {
        name: 'Budecort 200 Inhaler',
        genericName: 'Budesonide (200mcg per puff)',
        brand: 'Cipla',
        category: catMap['Respiratory & Anti-Allergy'],
        description: 'Metered dose corticosteroid inhaler providing maintenance control for persistent bronchial asthma and COPD.',
        price: 360.00,
        prescriptionRequired: true,
        dosageForm: 'Inhaler',
        strength: '200 mcg',
        manufacturer: 'Cipla Respiratory',
        sideEffects: 'Oral candidiasis (rinse mouth after use), mild hoarseness.',
        storageInstructions: 'Do not puncture or incinerate canister.',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 10
      },
      {
        name: 'Becosules Z Capsules',
        genericName: 'B-Complex Forte with Vitamin C and Zinc',
        brand: 'Pfizer',
        category: catMap['Vitamins & Health Supplements'],
        description: 'Therapeutic nutritional supplement for revitalizing cell energy, treating mouth ulcers, and fortifying systemic immunity.',
        price: 54.00,
        prescriptionRequired: false,
        dosageForm: 'Capsule',
        strength: 'Multi-nutrient',
        manufacturer: 'Pfizer Ltd.',
        sideEffects: 'Harmless bright yellow urine due to riboflavin excretion.',
        storageInstructions: 'Store in cool place away from excessive humidity.',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 40
      },
      {
        name: 'Shelcal 500mg Tablet',
        genericName: 'Calcium (500mg) + Vitamin D3 (250 IU)',
        brand: 'Torrent Pharma',
        category: catMap['Vitamins & Health Supplements'],
        description: 'Essential calcium & cholecalciferol formulation for bone mineral density, osteopenia, and calcium deficiency.',
        price: 135.00,
        prescriptionRequired: false,
        dosageForm: 'Tablet',
        strength: '500 mg',
        manufacturer: 'Torrent Pharmaceuticals',
        sideEffects: 'Mild constipation if water intake is inadequate.',
        storageInstructions: 'Store below 25°C in a dry place.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 30
      },
      {
        name: 'Pan-D Capsule',
        genericName: 'Pantoprazole Gastro-resistant (40mg) + Domperidone SR (30mg)',
        brand: 'Alkem Labs',
        category: catMap['Gastrointestinal & Digestion'],
        description: 'Gold-standard proton pump inhibitor combination for GERD, severe acidity, heartburn, and reflux esophagitis.',
        price: 219.00,
        prescriptionRequired: true,
        dosageForm: 'Capsule',
        strength: '70 mg',
        manufacturer: 'Alkem Laboratories Ltd.',
        sideEffects: 'Mild headache, diarrhea, nausea.',
        storageInstructions: 'Swallow whole 30 minutes before breakfast.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 30
      },
      {
        name: 'Betadine 10% Ointment (20g)',
        genericName: 'Povidone Iodine (10% w/w)',
        brand: 'Win-Medicare',
        category: catMap['Dermatological & Skin Care'],
        description: 'Topical microbicidal antiseptic ointment for prevention and treatment of skin infections in cuts, abrasions, burns and minor wounds.',
        price: 110.00,
        prescriptionRequired: false,
        dosageForm: 'Ointment',
        strength: '10% w/w',
        manufacturer: 'Win-Medicare Pvt Ltd',
        sideEffects: 'Rare localized skin irritation or redness.',
        storageInstructions: 'Store below 25°C. Do not freeze.',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        reorderLevel: 20
      }
    ];

    const medicines = await Medicine.create(medicineDefs);

    console.log('[Seeding] Creating realistic inventory batches (good shelf life, expiring in 30/60/90 days, and low stock)...');
    const now = new Date();
    const batchesToCreate = [];

    medicines.forEach((med, idx) => {
      // 1. Primary healthy batch (expires in 18-24 months)
      const healthyExpiry = new Date(now.getTime() + (500 + idx * 25) * 24 * 60 * 60 * 1000);
      const mfgDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
      const qty1 = 60 + (idx % 4) * 25;

      batchesToCreate.push({
        medicine: med._id,
        batchNumber: `BAT-2026-${1000 + idx}`,
        manufacturingDate: mfgDate,
        expiryDate: healthyExpiry,
        quantity: qty1,
        remainingQuantity: qty1,
        unitCost: Math.round(med.price * 0.65 * 100) / 100,
        supplier: 'Apollo Logistics & Warehousing',
        status: 'active'
      });

      // 2. Add expiring batches for selected medicines to satisfy requirement 5 (Expiry Tracking Report)
      if (idx === 0) {
        // Expiring in 20 days (Critical < 30 days)
        const exp20 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
        batchesToCreate.push({
          medicine: med._id,
          batchNumber: `BAT-EXP30-01`,
          manufacturingDate: new Date(now.getTime() - 340 * 24 * 60 * 60 * 1000),
          expiryDate: exp20,
          quantity: 25,
          remainingQuantity: 18,
          unitCost: Math.round(med.price * 0.65 * 100) / 100,
          supplier: 'MedLife Distributors Ltd.',
          status: 'active'
        });
      } else if (idx === 2) {
        // Expiring in 45 days (31-60 days)
        const exp45 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
        batchesToCreate.push({
          medicine: med._id,
          batchNumber: `BAT-EXP60-02`,
          manufacturingDate: new Date(now.getTime() - 320 * 24 * 60 * 60 * 1000),
          expiryDate: exp45,
          quantity: 40,
          remainingQuantity: 30,
          unitCost: Math.round(med.price * 0.65 * 100) / 100,
          supplier: 'Global Pharma Distributors',
          status: 'active'
        });
      } else if (idx === 4) {
        // Expiring in 75 days (61-90 days)
        const exp75 = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000);
        batchesToCreate.push({
          medicine: med._id,
          batchNumber: `BAT-EXP90-03`,
          manufacturingDate: new Date(now.getTime() - 290 * 24 * 60 * 60 * 1000),
          expiryDate: exp75,
          quantity: 50,
          remainingQuantity: 35,
          unitCost: Math.round(med.price * 0.65 * 100) / 100,
          supplier: 'Prime Rx Logistics',
          status: 'active'
        });
      } else if (idx === 6) {
        // Already expired batch (Expired status)
        const expiredDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        batchesToCreate.push({
          medicine: med._id,
          batchNumber: `BAT-EXPD-99`,
          manufacturingDate: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
          expiryDate: expiredDate,
          quantity: 20,
          remainingQuantity: 12,
          unitCost: Math.round(med.price * 0.65 * 100) / 100,
          supplier: 'Apex Healthcare Supplies',
          status: 'expired'
        });
      }
    });

    const createdBatches = await MedicineBatch.create(batchesToCreate);

    // Update totalStock on each medicine from active batches
    for (const med of medicines) {
      const activeBatches = createdBatches.filter(
        b => b.medicine.toString() === med._id.toString() && b.status === 'active' && b.expiryDate > now
      );
      const totalStock = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
      med.totalStock = totalStock;
      await med.save();
    }

    console.log('[Seeding] Creating sample doctor prescriptions...');
    const prescriptions = await Prescription.create([
      {
        customer: customer._id,
        patientName: 'Ananya Verma',
        patientAge: 28,
        doctorName: 'Dr. Suresh Rao, MD (Internal Medicine)',
        hospitalOrClinic: 'Apollo Health City, Jubilee Hills',
        prescriptionFile: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        notes: 'Prescribed Augmentin 625 Duo twice daily after meals for 5 days. Complete full course.',
        status: 'approved',
        reviewedBy: pharmacist._id,
        reviewNotes: 'Verified against medical council registration. Dosage and duration confirmed safe.',
        reviewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        customer: customer2._id,
        patientName: 'Rohit Kulkarni',
        patientAge: 42,
        doctorName: 'Dr. Neha Kapoor, Cardiologist',
        hospitalOrClinic: 'Care Hospitals, Banjara Hills',
        prescriptionFile: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        notes: 'Telma 40mg once daily in morning. Blood pressure monitoring required weekly.',
        status: 'pending',
        reviewNotes: ''
      }
    ]);

    console.log('[Seeding] Creating sample historical and active orders...');
    // Order 1: Delivered historical order with full payment
    const ord1Items = [
      { medicine: medicines[0]._id, name: medicines[0].name, price: medicines[0].price, quantity: 2, subtotal: medicines[0].price * 2 },
      { medicine: medicines[2]._id, name: medicines[2].name, price: medicines[2].price, quantity: 3, subtotal: medicines[2].price * 3 }
    ];
    const ord1Subtotal = ord1Items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const ord1Tax = Math.round(ord1Subtotal * 0.05 * 100) / 100;
    const ord1Total = ord1Subtotal + ord1Tax;

    const customerAddressWithPhone = {
      ...customer.address.toObject(),
      phone: customer.phone
    };
    const customer2AddressWithPhone = {
      ...customer2.address.toObject(),
      phone: customer2.phone
    };

    const order1 = await Order.create({
      orderNumber: 'MED-2026-90412',
      customer: customer._id,
      prescription: prescriptions[0]._id,
      items: ord1Items,
      subtotal: ord1Subtotal,
      tax: ord1Tax,
      deliveryFee: 0,
      totalAmount: ord1Total,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      orderStatus: 'delivered',
      shippingAddress: customerAddressWithPhone,
      deliveryPartner: deliveryPartner._id,
      deliveredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      timeline: [
        { status: 'placed', note: 'Order placed by customer', timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), updatedBy: customer._id },
        { status: 'confirmed', note: 'Prescription reviewed and order verified', timestamp: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000), updatedBy: pharmacist._id },
        { status: 'packed', note: 'Packed with tamper-evident pharmacy seal', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), updatedBy: pharmacist._id },
        { status: 'out_for_delivery', note: 'Picked up by Vikram Singh', timestamp: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000), updatedBy: deliveryPartner._id },
        { status: 'delivered', note: 'Package delivered to recipient and OTP verified', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), updatedBy: deliveryPartner._id }
      ]
    });

    await Payment.create({
      order: order1._id,
      customer: customer._id,
      amount: ord1Total,
      paymentMethod: 'card',
      transactionId: 'TXN-90412-SBX78',
      status: 'success',
      gatewayResponse: {
        simulatedCardLast4: '4242',
        authCode: 'AUTH-SBX-893120',
        message: 'Sandbox transaction authorized and settled successfully'
      },
      paymentDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
    });

    await Delivery.create({
      order: order1._id,
      deliveryPartner: deliveryPartner._id,
      status: 'delivered',
      customerName: customer.name,
      deliveryAddress: customerAddressWithPhone,
      assignedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      pickedUpAt: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      otpVerified: true
    });

    // Order 2: Active order Out For Delivery right now!
    const ord2Items = [
      { medicine: medicines[10]._id, name: medicines[10].name, price: medicines[10].price, quantity: 2, subtotal: medicines[10].price * 2 },
      { medicine: medicines[11]._id, name: medicines[11].name, price: medicines[11].price, quantity: 1, subtotal: medicines[11].price * 1 }
    ];
    const ord2Subtotal = ord2Items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const ord2Tax = Math.round(ord2Subtotal * 0.05 * 100) / 100;
    const ord2Delivery = ord2Subtotal > 500 ? 0 : 40;
    const ord2Total = ord2Subtotal + ord2Tax + ord2Delivery;

    const order2 = await Order.create({
      orderNumber: 'MED-2026-91823',
      customer: customer._id,
      items: ord2Items,
      subtotal: ord2Subtotal,
      tax: ord2Tax,
      deliveryFee: ord2Delivery,
      totalAmount: ord2Total,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      orderStatus: 'out_for_delivery',
      shippingAddress: customerAddressWithPhone,
      deliveryPartner: deliveryPartner._id,
      estimatedDelivery: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      timeline: [
        { status: 'placed', note: 'Order placed by customer', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), updatedBy: customer._id },
        { status: 'confirmed', note: 'Pharmacist approved stock batch allocation', timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), updatedBy: pharmacist._id },
        { status: 'packed', note: 'Order packed in hygienic cold-chain pouch', timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000), updatedBy: pharmacist._id },
        { status: 'out_for_delivery', note: 'Out for delivery with Vikram Singh', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), updatedBy: deliveryPartner._id }
      ]
    });

    await Payment.create({
      order: order2._id,
      customer: customer._id,
      amount: ord2Total,
      paymentMethod: 'upi',
      transactionId: 'TXN-91823-UPI99',
      status: 'success',
      gatewayResponse: {
        simulatedUpiId: 'ananya@oksbi',
        authCode: 'AUTH-SBX-112233',
        message: 'Sandbox UPI payment instant authorization'
      },
      paymentDate: new Date(now.getTime() - 5 * 60 * 60 * 1000)
    });

    await Delivery.create({
      order: order2._id,
      deliveryPartner: deliveryPartner._id,
      status: 'out_for_delivery',
      customerName: customer.name,
      deliveryAddress: customerAddressWithPhone,
      assignedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
      pickedUpAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      outForDeliveryAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      deliveryCode: '5914'
    });

    // Order 3: Order placed by Customer 2 (Pending verification)
    const ord3Items = [
      { medicine: medicines[4]._id, name: medicines[4].name, price: medicines[4].price, quantity: 1, subtotal: medicines[4].price }
    ];
    const ord3Subtotal = medicines[4].price;
    const ord3Tax = Math.round(ord3Subtotal * 0.05 * 100) / 100;
    const ord3Total = ord3Subtotal + ord3Tax + 40;

    await Order.create({
      orderNumber: 'MED-2026-92104',
      customer: customer2._id,
      prescription: prescriptions[1]._id,
      items: ord3Items,
      subtotal: ord3Subtotal,
      tax: ord3Tax,
      deliveryFee: 40,
      totalAmount: ord3Total,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      orderStatus: 'placed',
      shippingAddress: customer2AddressWithPhone,
      estimatedDelivery: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      timeline: [
        { status: 'placed', note: 'Order placed, awaiting prescription verification by pharmacist', timestamp: now, updatedBy: customer2._id }
      ]
    });

    console.log('[Seeding] SUCCESS: Database populated with rich test datasets!');
    console.log('----------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('Admin:       admin@medipharm.com       / Admin@123');
    console.log('Pharmacist:  pharmacist@medipharm.com  / Pharma@123');
    console.log('Customer:    customer@medipharm.com    / Customer@123');
    console.log('Delivery:    delivery@medipharm.com    / Delivery@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seeding Error]:', error);
  }
};

// If run directly via "node utils/seedData.js"
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const connectDB = require('../config/db');

  connectDB()
    .then(async () => {
      await seedDatabase();
      console.log('[Seed CLI] Completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('[Seed CLI Failed]:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
