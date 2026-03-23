-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  page TEXT,
  target TEXT,
  data JSONB DEFAULT '{}',
  referrer TEXT,
  user_agent TEXT,
  screen_w INT,
  screen_h INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics(page);

GRANT ALL ON analytics TO fourlinq;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fourlinq;

-- Seed fake inquiries
INSERT INTO inquiries (type, ref_id, name, email, phone, product_name, message, config, status, created_at) VALUES
('contact', 'CT-ABC001', 'Maria Santos', 'maria.santos@gmail.com', '0917-555-1234', NULL, 'Hi, I am interested in casement windows for my new house in Alabang. Can you send someone for a site visit?', NULL, 'new', now() - interval '2 hours'),
('contact', 'CT-ABC002', 'James Reyes', 'james.reyes@yahoo.com', '0918-555-5678', NULL, 'Do you have showroom hours for the Ortigas branch? I want to see the wood grain finishes in person.', NULL, 'contacted', now() - interval '1 day'),
('contact', 'CT-ABC003', 'Anna Cruz', 'anna.cruz@outlook.com', NULL, NULL, 'What is the difference between uPVC and aluminum? Which one do you recommend for a beachfront property in Cebu?', NULL, 'new', now() - interval '3 hours'),
('quote', 'QR-DEF001', 'Roberto Tan', 'roberto.tan@gmail.com', '0925-555-9012', 'Sliding', 'Need sliding windows for entire 2nd floor', '{"productName": "Sliding", "quantity": "12 panels", "dimensions": "1200x1400mm", "finish": "Walnut", "timeline": "2 months"}', 'quoted', now() - interval '3 days'),
('quote', 'QR-DEF002', 'Lisa Mendoza', 'lisa.mendoza@email.com', '0917-555-3456', 'Casement', 'Replacing old aluminum windows with uPVC casement', '{"productName": "Casement", "quantity": "8 panels", "dimensions": "900x1200mm", "finish": "White", "timeline": "1 month"}', 'new', now() - interval '5 hours'),
('quote', 'QR-DEF003', 'Architect David Lim', 'david.lim@dlarchitects.ph', '0918-555-7890', 'Slide and Fold', 'Commercial project - restaurant patio enclosure', '{"productName": "Slide and Fold", "quantity": "3 sets", "dimensions": "4000x2400mm", "finish": "Jet Black", "timeline": "3 months", "budget": "PHP 500K-800K"}', 'contacted', now() - interval '2 days'),
('quote', 'QR-DEF004', 'Patricia Go', 'patricia.go@gmail.com', '0916-555-2345', 'Awning', NULL, '{"productName": "Awning", "quantity": "4 panels", "dimensions": "1000x600mm", "finish": "Golden Oak"}', 'new', now() - interval '8 hours'),
('configuration', 'CFG-GHI001', 'Mark Rivera', 'mark.rivera@email.com', '0917-555-6789', NULL, NULL, '{"type": "casement", "finish": "walnut", "glass": "low-e-coated", "width": 1200, "height": 1400}', 'new', now() - interval '1 day'),
('configuration', 'CFG-GHI002', 'Sarah Chen', 'sarah.chen@gmail.com', '0918-555-0123', NULL, NULL, '{"type": "sliding", "finish": "jet-black", "glass": "tinted-grey", "width": 2400, "height": 1800}', 'new', now() - interval '6 hours'),
('configuration', 'CFG-GHI003', 'Carlo Villanueva', 'carlo.v@yahoo.com', NULL, NULL, NULL, '{"type": "slide-and-fold", "finish": "charcoal-gray", "glass": "clear-float", "width": 4000, "height": 2400}', 'new', now() - interval '12 hours'),
('contact', 'CT-ABC004', 'Engineer Mike Torres', 'mike.torres@buildcorp.ph', '0925-555-4567', NULL, 'We are a construction company looking for a supplier for a 50-unit condo project. Need pricing for bulk casement and sliding windows.', NULL, 'new', now() - interval '30 minutes'),
('quote', 'QR-DEF005', 'Jenny Lim', 'jenny.lim@gmail.com', '0917-555-8901', 'Special Shapes', 'Want a round window for the facade of our heritage-style home', '{"productName": "Special Shapes", "quantity": "1", "dimensions": "custom - 1500mm diameter circle", "finish": "Dark Oak"}', 'new', now() - interval '4 hours');
