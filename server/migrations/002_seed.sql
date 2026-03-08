-- FourlinQ Seed Data — Migration 002
-- Seeds all lookup tables + 8 products from the frontend data files
-- Run: psql -U <user> -d fourlinq -f server/migrations/002_seed.sql

-- ============================================
-- Organization
-- ============================================

INSERT INTO
    organization (
        name,
        slug,
        website,
        currency,
        timezone,
        locale
    )
VALUES (
        'FourlinQ Windows & Doors',
        'fourlinq',
        'https://fourlinq.ph',
        'PHP',
        'Asia/Manila',
        'en-PH'
    );

-- ============================================
-- Product Categories (match frontend ProductCategory type)
-- ============================================

INSERT INTO
    product_category (
        organization_id,
        name,
        slug,
        sort_order
    )
VALUES (1, 'Window', 'windows', 1),
    (1, 'Door', 'doors', 2),
    (1, 'System', 'systems', 3);

-- ============================================
-- Product Types (match frontend WindowIcons.tsx + Navbar.tsx)
-- ============================================

INSERT INTO
    product_type (
        organization_id,
        product_category_id,
        name,
        slug,
        icon_key,
        opening_mechanism,
        is_operable,
        requires_track,
        sort_order
    )
VALUES
    -- Windows (category_id = 1)
    (
        1,
        1,
        'Casement',
        'casement',
        'casement',
        'side_hinge',
        true,
        false,
        1
    ),
    (
        1,
        1,
        'Awning',
        'awning',
        'awning',
        'top_hinge',
        true,
        false,
        2
    ),
    (
        1,
        1,
        'Sliding',
        'sliding',
        'sliding',
        'slide',
        true,
        true,
        3
    ),
    (
        1,
        1,
        'Fixed',
        'fixed',
        'fixed',
        'fixed',
        false,
        false,
        4
    ),
    (
        1,
        1,
        'Tilt & Turn',
        'tilt-turn',
        'tilt-turn',
        'tilt_turn',
        true,
        false,
        5
    ),
    -- Doors (category_id = 2)
    (
        1,
        2,
        'Sliding Door',
        'sliding-door',
        'sliding-door',
        'slide',
        true,
        true,
        1
    ),
    (
        1,
        2,
        'Bifold',
        'bifold',
        'bifold',
        'fold',
        true,
        true,
        2
    ),
    (
        1,
        2,
        'Lift & Slide',
        'lift-slide',
        'lift-slide',
        'lift_slide',
        true,
        true,
        3
    ),
    (
        1,
        2,
        'French Door',
        'french-door',
        'french-door',
        'side_hinge',
        true,
        false,
        4
    ),
    (
        1,
        2,
        'Entrance',
        'entrance',
        'entrance',
        'side_hinge',
        true,
        false,
        5
    );

-- ============================================
-- Finishes (match frontend productFinishes)
-- ============================================

INSERT INTO
    finish (
        organization_id,
        name,
        slug,
        hex_color,
        finish_type,
        is_standard,
        sort_order
    )
VALUES (
        1,
        'Matte Black',
        'matte-black',
        '#1A1A1A',
        'solid',
        true,
        1
    ),
    (
        1,
        'Dark Grey',
        'dark-grey',
        '#4A4A4A',
        'solid',
        true,
        2
    ),
    (
        1,
        'Bronze',
        'bronze',
        '#8B6914',
        'metallic',
        true,
        3
    ),
    (
        1,
        'Sand',
        'sand',
        '#C2B280',
        'solid',
        true,
        4
    ),
    (
        1,
        'White',
        'white',
        '#F5F5F0',
        'solid',
        true,
        5
    ),
    (
        1,
        'Anthracite',
        'anthracite',
        '#383E42',
        'solid',
        true,
        6
    );

-- ============================================
-- Glass Types (match frontend glassOptions)
-- ============================================

INSERT INTO
    glass_type (
        organization_id,
        name,
        slug,
        glass_category,
        sort_order
    )
VALUES (
        1,
        'Clear Float',
        'clear-float',
        'single',
        1
    ),
    (
        1,
        'Low-E Coated',
        'low-e-coated',
        'double',
        2
    ),
    (
        1,
        'Frosted Privacy',
        'frosted-privacy',
        'single',
        3
    ),
    (
        1,
        'Tinted Bronze',
        'tinted-bronze',
        'single',
        4
    ),
    (
        1,
        'Tinted Grey',
        'tinted-grey',
        'single',
        5
    ),
    (
        1,
        'Laminated Safety',
        'laminated-safety',
        'laminated',
        6
    ),
    (
        1,
        'Decorative Lead',
        'decorative-lead',
        'single',
        7
    ),
    (
        1,
        'Reflective',
        'reflective',
        'single',
        8
    ),
    (
        1,
        'Obscure Pattern',
        'obscure-pattern',
        'single',
        9
    ),
    (
        1,
        'Clear Sidelight',
        'clear-sidelight',
        'single',
        10
    );

-- ============================================
-- Products (match frontend products.ts exactly)
-- ============================================

-- Casement 70 (product_type_id = 1 casement, category = windows)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        1,
        'CAS-70',
        'Casement 70 Series',
        'casement-70',
        'Multi-chamber casement with superior thermal and acoustic performance.',
        'Our flagship casement window system featuring a 70mm multi-chamber profile for superior thermal insulation. Ideal for bedrooms, living rooms, and offices across the Philippines where climate control and noise reduction are essential.',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        true,
        1
    );

-- Sliding 85 (product_type_id = 3 sliding, category = windows)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        3,
        'SLD-85',
        'Sliding 85 Series',
        'sliding-85',
        'Wide-opening sliding system for panoramic views and effortless operation.',
        'Premium sliding window engineered for wide openings and panoramic views. The 85mm profile provides excellent structural integrity while the smooth glide mechanism ensures effortless operation even in large sizes.',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        true,
        2
    );

-- Fixed Panel (product_type_id = 4 fixed, category = windows)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        4,
        'FXD-70',
        'Fixed Panorama Panel',
        'fixed-panel',
        'Floor-to-ceiling fixed glazing for maximum light and views.',
        'Floor-to-ceiling fixed glass panel designed for maximum light and unobstructed views. Perfect for modern Philippine homes seeking to blend indoor and outdoor living while maintaining full climate control.',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
        true,
        3
    );

-- French Door (product_type_id = 9 french-door, category = doors)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        9,
        'FRD-70',
        'French Door Classic',
        'french-door',
        'Classic double-leaf French doors with multi-point security locking.',
        'Elegant double-leaf French door system bringing European sophistication to Philippine homes. Features multi-point locking for security and a low threshold option for seamless indoor-outdoor transitions.',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        true,
        4
    );

-- Lift & Slide Terrace (product_type_id = 8 lift-slide, category = doors)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        8,
        'LFS-85',
        'Lift & Slide Terrace',
        'sliding-door',
        'Heavy-duty lift-and-slide for expansive terrace openings.',
        'Our premium lift-and-slide door system handles panels up to 200kg with fingertip ease. Designed for luxury Philippine residences, resorts, and condominiums seeking expansive openings with uncompromised weatherproofing.',
        'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80',
        true,
        5
    );

-- Bifold Horizon (product_type_id = 7 bifold, category = doors)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        7,
        'BFD-76',
        'Bifold Horizon',
        'bifold-system',
        'Multi-panel folding system that opens entire walls to the outdoors.',
        'Multi-panel folding door system that opens entire walls to the outdoors. Available in 2 to 7 panel configurations, the Bifold Horizon transforms living spaces and is engineered to withstand Philippine typhoon conditions.',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
        true,
        6
    );

-- Entrance Prestige (product_type_id = 10 entrance, category = systems actually — but entrance is under doors type)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        10,
        'ENT-82',
        'Entrance Prestige',
        'entrance-system',
        'Reinforced entrance system with steel core and premium hardware.',
        'Complete entrance door system with reinforced steel core and premium hardware. Combines the aesthetic versatility of uPVC with the security demands of main entry doors for Philippine homes and commercial properties.',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
        true,
        7
    );

-- Curtain Wall System (product_type_id = 4 fixed — closest match, category = systems)
INSERT INTO
    product (
        organization_id,
        product_type_id,
        sku_prefix,
        name,
        slug,
        short_description,
        description,
        thumbnail_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        4,
        'CWS-50',
        'Curtain Wall System',
        'curtain-wall',
        'Commercial-grade curtain wall with uPVC thermal break technology.',
        'Architectural curtain wall solution for commercial and high-rise residential projects. Combines structural mullion-transom framework with uPVC thermal break technology for energy-efficient building envelopes.',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        true,
        8
    );

-- ============================================
-- Product Features / Specs (match frontend product.specs arrays)
-- ============================================

-- Casement 70 specs (product_id = 1)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        1,
        'thermal',
        '70mm multi-chamber profile',
        '70mm multi-chamber profile',
        1
    ),
    (
        1,
        'weather',
        'Double-sealed weatherstrip',
        'Double-sealed weatherstrip',
        2
    ),
    (
        1,
        'aesthetic',
        'Up to 28mm glazing capacity',
        'Up to 28mm glazing capacity',
        3
    ),
    (
        1,
        'thermal',
        'Uw value: 1.3 W/m²K',
        'Uw value: 1.3 W/m²K',
        4
    );

-- Sliding 85 specs (product_id = 2)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        2,
        'thermal',
        '85mm reinforced profile',
        '85mm reinforced profile',
        1
    ),
    (
        2,
        'aesthetic',
        'Tandem roller system',
        'Tandem roller system',
        2
    ),
    (
        2,
        'aesthetic',
        'Up to 36mm glazing capacity',
        'Up to 36mm glazing capacity',
        3
    ),
    (
        2,
        'security',
        'Anti-lift security block',
        'Anti-lift security block',
        4
    );

-- Fixed Panel specs (product_id = 3)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        3,
        'thermal',
        '70mm structural profile',
        '70mm structural profile',
        1
    ),
    (
        3,
        'aesthetic',
        'Up to 44mm triple glazing',
        'Up to 44mm triple glazing',
        2
    ),
    (
        3,
        'aesthetic',
        'Structural silicone option',
        'Structural silicone option',
        3
    ),
    (
        3,
        'aesthetic',
        'Maximum panel: 2.4m × 3.0m',
        'Maximum panel: 2.4m × 3.0m',
        4
    );

-- French Door specs (product_id = 4)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        4,
        'thermal',
        '70mm reinforced door profile',
        '70mm reinforced door profile',
        1
    ),
    (
        4,
        'security',
        'Multi-point espagnolette lock',
        'Multi-point espagnolette lock',
        2
    ),
    (
        4,
        'aesthetic',
        'Low threshold (20mm) option',
        'Low threshold (20mm) option',
        3
    ),
    (
        4,
        'aesthetic',
        'Up to 36mm glazing',
        'Up to 36mm glazing',
        4
    );

-- Lift & Slide specs (product_id = 5)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        5,
        'thermal',
        '85mm heavy-duty profile',
        '85mm heavy-duty profile',
        1
    ),
    (
        5,
        'aesthetic',
        'Lift-and-slide mechanism (200kg)',
        'Lift-and-slide mechanism (200kg)',
        2
    ),
    (
        5,
        'weather',
        'Triple weatherseal system',
        'Triple weatherseal system',
        3
    ),
    (
        5,
        'aesthetic',
        'Up to 44mm glazing',
        'Up to 44mm glazing',
        4
    );

-- Bifold specs (product_id = 6)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        6,
        'thermal',
        '76mm folding profile',
        '76mm folding profile',
        1
    ),
    (
        6,
        'aesthetic',
        '2–7 panel configurations',
        '2–7 panel configurations',
        2
    ),
    (
        6,
        'aesthetic',
        'Top-hung or bottom-rolling',
        'Top-hung or bottom-rolling',
        3
    ),
    (
        6,
        'weather',
        'Typhoon-rated hardware',
        'Typhoon-rated hardware',
        4
    );

-- Entrance Prestige specs (product_id = 7)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        7,
        'thermal',
        '82mm entrance profile',
        '82mm entrance profile',
        1
    ),
    (
        7,
        'security',
        'Steel-reinforced core',
        'Steel-reinforced core',
        2
    ),
    (
        7,
        'security',
        '5-point security lock',
        '5-point security lock',
        3
    ),
    (
        7,
        'security',
        'RC2 burglar resistance',
        'RC2 burglar resistance',
        4
    );

-- Curtain Wall specs (product_id = 8)
INSERT INTO
    product_feature (
        product_id,
        feature_type,
        label,
        value,
        sort_order
    )
VALUES (
        8,
        'aesthetic',
        '50×100mm mullion profile',
        '50×100mm mullion profile',
        1
    ),
    (
        8,
        'aesthetic',
        'Structural glazing option',
        'Structural glazing option',
        2
    ),
    (
        8,
        'thermal',
        'Thermal break technology',
        'Thermal break technology',
        3
    ),
    (
        8,
        'weather',
        'Wind load: up to 3.0 kPa',
        'Wind load: up to 3.0 kPa',
        4
    );

-- ============================================
-- Product ↔ Finish junction (all products get all 6 finishes)
-- ============================================

INSERT INTO
    product_finish (product_id, finish_id)
SELECT p.product_id, f.finish_id
FROM product p
    CROSS JOIN finish f
WHERE
    p.organization_id = 1
    AND f.organization_id = 1;

-- ============================================
-- Product ↔ Glass junction (match frontend product.glassOptions)
-- ============================================

-- Casement 70: Clear Float, Low-E Coated, Frosted Privacy, Tinted Bronze
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (1, 1),
    (1, 2),
    (1, 3),
    (1, 4);
-- Sliding 85: Clear Float, Low-E Coated, Tinted Grey, Laminated Safety
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (2, 1),
    (2, 2),
    (2, 5),
    (2, 6);
-- Fixed Panel: Clear Float, Low-E Coated, Tinted Bronze, Laminated Safety
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (3, 1),
    (3, 2),
    (3, 4),
    (3, 6);
-- French Door: Clear Float, Frosted Privacy, Laminated Safety, Decorative Lead
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (4, 1),
    (4, 3),
    (4, 6),
    (4, 7);
-- Lift & Slide: Clear Float, Low-E Coated, Tinted Grey, Laminated Safety
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (5, 1),
    (5, 2),
    (5, 5),
    (5, 6);
-- Bifold: Clear Float, Low-E Coated, Tinted Bronze, Laminated Safety
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (6, 1),
    (6, 2),
    (6, 4),
    (6, 6);
-- Entrance: Frosted Privacy, Decorative Lead, Clear Sidelight, Obscure Pattern
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (7, 3),
    (7, 7),
    (7, 10),
    (7, 9);
-- Curtain Wall: Clear Float, Low-E Coated, Reflective, Laminated Safety
INSERT INTO
    product_glass (product_id, glass_type_id)
VALUES (8, 1),
    (8, 2),
    (8, 8),
    (8, 6);

-- ============================================
-- Projects (match frontend projects.ts)
-- ============================================

INSERT INTO
    project (
        organization_id,
        project_number,
        name,
        location,
        image_url,
        is_featured,
        sort_order
    )
VALUES (
        1,
        'PRJ-2024-00001',
        'Modern Villa Renovation',
        'Alabang, Metro Manila',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
        true,
        1
    ),
    (
        1,
        'PRJ-2024-00002',
        'Beachfront Resort Suite',
        'Mactan, Cebu',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
        true,
        2
    ),
    (
        1,
        'PRJ-2024-00003',
        'High-Rise Penthouse',
        'BGC, Taguig',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
        true,
        3
    ),
    (
        1,
        'PRJ-2024-00004',
        'Hillside Family Home',
        'Tagaytay, Cavite',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
        true,
        4
    ),
    (
        1,
        'PRJ-2024-00005',
        'Boutique Hotel Façade',
        'Boracay, Aklan',
        'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80',
        true,
        5
    ),
    (
        1,
        'PRJ-2024-00006',
        'Corporate Office Fitout',
        'Makati City',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
        true,
        6
    );

-- ============================================
-- System roles
-- ============================================

INSERT INTO
    role (
        organization_id,
        name,
        label,
        is_system
    )
VALUES (
        1,
        'super_admin',
        'Super Admin',
        true
    ),
    (1, 'admin', 'Admin', true),
    (
        1,
        'agent',
        'Sales Agent',
        true
    ),
    (
        1,
        'customer',
        'Customer',
        false
    ),
    (
        1,
        'partner',
        'Partner',
        false
    ),
    (1, 'viewer', 'Viewer', false);