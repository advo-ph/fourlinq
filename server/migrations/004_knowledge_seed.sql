-- FourlinQ Knowledge Base Seed — Migration 004
-- Seeds ~30 knowledge chunks for the LinQ chatbot
-- Embeddings will be computed at runtime by the seeding script
-- Run: npx tsx server/scripts/seed-knowledge.ts

-- ============================================
-- Knowledge Bases
-- ============================================

INSERT INTO
    knowledge_base (
        organization_id,
        name,
        description,
        kb_type
    )
VALUES (
        1,
        'Product Facts',
        'Technical specs, features, and details for all FourlinQ products',
        'product'
    ),
    (
        1,
        'Why uPVC',
        'Benefits and advantages of uPVC over aluminium, timber, and steel',
        'educational'
    ),
    (
        1,
        'FAQ',
        'Frequently asked questions about FourlinQ products and services',
        'faq'
    ),
    (
        1,
        'Objection Handling',
        'Responses to common objections and misconceptions about uPVC',
        'objection'
    ),
    (
        1,
        'Company Info',
        'About FourlinQ, showroom details, warranty, installation',
        'policy'
    );

-- ============================================
-- Knowledge Chunks (embeddings filled by seed script)
-- ============================================

-- === Product Facts (kb_id = 1) ===


INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags, product_id) VALUES
(1, 'Casement 70 Series Overview',
 'The Casement 70 Series is FourlinQ''s flagship casement window. It features a 70mm multi-chamber profile for superior thermal insulation with a Uw value of 1.3 W/m²K. It includes double-sealed weatherstrips and supports up to 28mm glazing capacity. Available in 6 frame finishes (Matte Black, Dark Grey, Bronze, Sand, White, Anthracite) and 4 glass options (Clear Float, Low-E Coated, Frosted Privacy, Tinted Bronze). Ideal for bedrooms, living rooms, and offices in the Philippines.',
 'product_spec', ARRAY['casement', 'window', 'thermal', '70mm'], 1),

(1, 'Sliding 85 Series Overview',
 'The Sliding 85 Series is a premium sliding window engineered for wide openings and panoramic views. It has an 85mm reinforced profile with a tandem roller system for smooth, effortless operation. Supports up to 36mm glazing and includes an anti-lift security block. Available in all 6 standard finishes and glass options including Clear Float, Low-E Coated, Tinted Grey, and Laminated Safety.',
 'product_spec', ARRAY['sliding', 'window', '85mm', 'panoramic'], 2),

(1, 'Fixed Panorama Panel Overview',
 'The Fixed Panorama Panel is a floor-to-ceiling fixed glass panel designed for maximum natural light and unobstructed views. It uses a 70mm structural profile and supports up to 44mm triple glazing. Maximum panel size is 2.4m × 3.0m. Can use structural silicone for a frameless exterior look. Perfect for modern Philippine homes blending indoor and outdoor living.',
 'product_spec', ARRAY['fixed', 'window', 'panoramic', 'triple-glazing'], 3),

(1, 'French Door Classic Overview',
 'The French Door Classic is an elegant double-leaf door system featuring a 70mm reinforced door profile with multi-point espagnolette locking for security. It has a low threshold option (20mm) for seamless indoor-outdoor transitions and supports up to 36mm glazing. Available glass options include Clear Float, Frosted Privacy, Laminated Safety, and Decorative Lead.',
 'product_spec', ARRAY['french-door', 'door', 'security', 'double-leaf'], 4),

(1, 'Lift & Slide Terrace Overview',
 'The Lift & Slide Terrace is a premium lift-and-slide door system that handles panels up to 200kg with fingertip ease. It uses an 85mm heavy-duty profile with a triple weatherseal system. Supports up to 44mm glazing. Designed for luxury Philippine residences, resorts, and condominiums seeking expansive openings with uncompromised weatherproofing.',
 'product_spec', ARRAY['lift-slide', 'door', 'heavy-duty', 'luxury'], 5),

(1, 'Bifold Horizon Overview',
 'The Bifold Horizon is a multi-panel folding door system that opens entire walls to the outdoors. Available in 2 to 7 panel configurations with a 76mm folding profile. Offers both top-hung and bottom-rolling options. Features typhoon-rated hardware and is engineered to withstand Philippine weather conditions.',
 'product_spec', ARRAY['bifold', 'door', 'folding', 'typhoon-rated'], 6),

(1, 'Entrance Prestige Overview',
 'The Entrance Prestige is a complete entrance door system with an 82mm profile and reinforced steel core. Features a 5-point security lock and achieves RC2 burglar resistance rating. Combines the aesthetic versatility of uPVC with the security demands of main entry doors. Available with Frosted Privacy, Decorative Lead, Clear Sidelight, and Obscure Pattern glass.',
 'product_spec', ARRAY['entrance', 'door', 'security', 'steel-core'], 7),

(1, 'Curtain Wall System Overview',
 'The Curtain Wall System is an architectural solution for commercial and high-rise residential projects. Uses a 50×100mm mullion profile with structural glazing option and uPVC thermal break technology. Wind load rated up to 3.0 kPa. Ideal for energy-efficient building envelopes in the Philippines.',
 'product_spec', ARRAY['curtain-wall', 'system', 'commercial', 'high-rise'], 8);

-- === Why uPVC (kb_id = 2) ===


INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags) VALUES
(2, 'uPVC vs Aluminium — Thermal Performance',
 'uPVC profiles provide dramatically better thermal insulation than aluminium. A typical uPVC window achieves a Uw value of 1.3–1.6 W/m²K, while aluminium windows typically rate 3.5–5.0 W/m²K without thermal breaks. This means uPVC can reduce air conditioning energy costs by 30–40% in the Philippine tropical climate. uPVC is inherently a poor conductor of heat, unlike aluminium which rapidly transfers heat from exterior to interior.',
 'comparison', ARRAY['upvc', 'aluminium', 'thermal', 'energy-saving']),

(2, 'uPVC vs Timber — Maintenance',
 'uPVC requires virtually zero maintenance compared to timber. Timber windows need repainting every 3–5 years, are susceptible to termite damage (a major concern in the Philippines), and can warp or rot with humidity. uPVC never needs painting, is impervious to termites and moisture, and retains its appearance for 25+ years. The lifetime cost of uPVC is significantly lower than timber when factoring in maintenance.',
 'comparison', ARRAY['upvc', 'timber', 'maintenance', 'termite-proof']),

(2, 'uPVC Acoustic Performance',
 'FourlinQ uPVC windows achieve up to 45dB noise reduction, making them ideal for homes near busy streets, airports, or commercial areas. The multi-chamber profile design combined with proper glazing creates multiple air barriers that block sound waves. Compared to standard single-pane aluminium windows (10–15dB reduction), the difference is dramatic — equivalent to moving from beside a highway to a quiet suburb.',
 'fact', ARRAY['upvc', 'acoustic', 'noise-reduction', 'soundproofing']),

(2, 'uPVC Weather Resistance — Philippine Climate',
 'FourlinQ uPVC systems are specifically engineered for the Philippine tropical climate. They withstand typhoon-force winds (tested to 200+ km/h), UV exposure without fading or degradation, and extreme humidity without warping. The profiles include UV stabilizers that prevent yellowing for 25+ years. All hardware is marine-grade stainless steel to resist salt air corrosion in coastal areas like Cebu, Boracay, and Batangas.',
 'fact', ARRAY['upvc', 'weather', 'typhoon', 'philippines']),

(2, 'uPVC Environmental Benefits',
 'uPVC is 100% recyclable and can be recycled up to 10 times without losing structural integrity. FourlinQ uses lead-free, calcium-zinc stabilized profiles that are environmentally safe. The energy savings from better insulation mean a typical Philippine home reduces its carbon footprint by 1.5–2 tonnes of CO₂ per year by switching to uPVC windows.',
 'fact', ARRAY['upvc', 'environment', 'recyclable', 'eco-friendly']);

-- === FAQ (kb_id = 3) ===


INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags) VALUES
(3, 'How long do FourlinQ windows last?',
 'FourlinQ uPVC windows and doors are designed to last 25–30 years with virtually zero maintenance. The profiles will not rot, rust, warp, or fade. We provide a 10-year manufacturer warranty covering profile discoloration and structural integrity. Hardware components carry a 5-year warranty.',
 'faq', ARRAY['warranty', 'lifespan', 'durability']),

(3, 'What finishes are available?',
 'FourlinQ offers 6 standard finishes: Matte Black (#1A1A1A), Dark Grey (#4A4A4A), Bronze metallic (#8B6914), Sand (#C2B280), White (#F5F5F0), and Anthracite (#383E42). Custom RAL colors are available on request for orders above 10 units with a 4-week lead time premium.',
 'faq', ARRAY['finish', 'color', 'customization']),

(3, 'What is the lead time for orders?',
 'Standard orders are fulfilled in 4–6 weeks from confirmed order. Custom sizes and configurations may take 6–8 weeks. Curtain wall projects are quoted individually with typical lead times of 8–12 weeks. Express delivery is available for standard sizes at a 15% premium.',
 'faq', ARRAY['delivery', 'lead-time', 'ordering']),

(3, 'Do you offer installation services?',
 'Yes, FourlinQ provides professional installation through our certified installer network covering Metro Manila, Cebu, Davao, and major Philippine cities. Installation is quoted separately from the product cost. Our installers are factory-trained and all installations include a post-installation quality inspection. We also provide installation guides for contractor teams.',
 'faq', ARRAY['installation', 'service', 'coverage']),

(3, 'Where is the FourlinQ showroom?',
 'The FourlinQ showroom is located in Metro Manila, Philippines. You can visit to see and touch all our window and door systems in person. The showroom features working samples of every profile type, all finish options, and various glass configurations. Walk-ins are welcome, but booking an appointment ensures a dedicated consultation with our product specialists. Contact us at +63 2 8123 4567 or info@fourlinq.ph.',
 'faq', ARRAY['showroom', 'visit', 'contact']),

(3, 'How much do FourlinQ windows cost?',
 'FourlinQ window pricing depends on the type, size, finish, and glass configuration. As a guide: casement windows start from approximately ₱8,000–₱15,000 per panel for standard sizes. Sliding windows range from ₱12,000–₱25,000 per unit. Door systems range from ₱35,000–₱120,000 depending on configuration. For an accurate quote, use our Design Tool to configure your exact requirements, or contact us for a free consultation.',
 'faq', ARRAY['pricing', 'cost', 'quote']);

-- === Objection Handling (kb_id = 4) ===


INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags) VALUES
(4, 'Objection: uPVC looks cheap or plastic-like',
 'This is a common misconception based on early-generation uPVC from the 1980s. Modern FourlinQ profiles use premium German-engineered formulations with a matte, brushed texture that closely resembles powder-coated aluminium. Our Dark Grey and Anthracite finishes are visually indistinguishable from premium aluminium systems. We use calcium-zinc stabilizers (not lead) and multi-stage co-extrusion for a refined surface finish. Many architects and interior designers now prefer uPVC for its cleaner appearance.',
 'objection_response', ARRAY['objection', 'appearance', 'cheap', 'plastic']),

(4, 'Objection: uPVC cannot handle Philippine typhoons',
 'FourlinQ systems are specifically engineered for typhoon resistance. Our profiles are reinforced with galvanized steel inserts and all hardware is tested to withstand wind pressures equivalent to Signal No. 5 typhoons (200+ km/h). We use multi-point locking mechanisms and double or triple weatherseals. Our Curtain Wall System is rated to 3.0 kPa wind load. FourlinQ systems have withstood multiple super typhoons in real-world installations across the Visayas and Bicol regions.',
 'objection_response', ARRAY['objection', 'typhoon', 'strength', 'durability']),

(4, 'Objection: uPVC yellows over time',
 'Our profiles contain advanced UV stabilizers that prevent yellowing for 25+ years, even under the intense Philippine tropical sun. We provide a written 10-year warranty against discoloration. Independent laboratory testing confirms our White profile maintains a ΔE color difference of less than 1.5 after 10 years of accelerated weathering (equivalent to 25 years of real exposure). This is well within the "imperceptible to the naked eye" threshold.',
 'objection_response', ARRAY['objection', 'yellowing', 'uv', 'durability']),

(4, 'Objection: Aluminium is stronger than uPVC',
 'While raw aluminium has higher tensile strength, this comparison is misleading for windows and doors. FourlinQ profiles are internally reinforced with galvanized steel bars where structural strength is needed. The multi-chamber design of our profiles provides excellent rigidity. More importantly, uPVC''s inherent flexibility is actually an advantage in typhoon-prone areas — it flexes and recovers rather than permanently deforming like aluminium under extreme wind load.',
 'objection_response', ARRAY['objection', 'strength', 'aluminium', 'steel-reinforced']);

-- === Company Info (kb_id = 5) ===


INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags) VALUES
(5, 'About FourlinQ',
 'FourlinQ is a premium uPVC windows and doors manufacturer serving the Philippine market. We use German-engineered profiles and European hardware to deliver world-class fenestration solutions tailored for the tropical Philippine climate. Our product range includes casement windows, sliding windows, fixed panels, French doors, bifold doors, lift-and-slide doors, entrance doors, and curtain wall systems. FourlinQ is committed to quality, innovation, and customer service excellence.',
 'fact', ARRAY['company', 'about', 'fourlinq']),

(5, 'FourlinQ Warranty Policy',
 'FourlinQ provides comprehensive warranty coverage: 10-year warranty on all uPVC profiles covering structural integrity and color stability. 5-year warranty on all hardware components (hinges, locks, rollers). 2-year warranty on glass units against seal failure. Warranty is void if products are installed by non-certified installers without FourlinQ supervision. Extended warranty packages are available.',
 'policy', ARRAY['warranty', 'guarantee', 'coverage']),

(5, 'FourlinQ Installation Process',
 'The FourlinQ installation process follows 5 steps: (1) Free consultation and site survey — our team visits your property to take precise measurements. (2) Custom quotation — we provide a detailed quote within 48 hours of the site survey. (3) Production — your custom-made units are manufactured in 4–6 weeks. (4) Professional installation — our certified installers complete installation, typically 1–2 days for residential projects. (5) Quality inspection — a final inspection ensures everything meets our standards.',
 'process', ARRAY['installation', 'process', 'steps']);