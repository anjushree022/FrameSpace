// Sample content for `npm run seed`. Photographs are hosted on Unsplash (not
// Cloudinary); the frontend swaps in a placeholder if one fails to load.
// Captions are illustrative sample copy.

export const DEMO_PASSWORD = 'demo1234';
export const ADMIN_PASSWORD = 'admin1234';

export const unsplash = (id, w = 900, ratio = 1) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w / ratio)}&q=80`;

export const avatar = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=256&h=256&q=80`;

export const DAY = 86400000;

export const USERS = [
  ['u0', 'FrameSpace Admin', 'admin', 'admin@framespace.app', 'admin', 'Keeping the gallery tidy.', ''],
  ['u1', 'Aarav Mehta', 'aarav', 'aarav@example.com', 'user', 'Chasing light across the Western Ghats. Slow mornings, long lenses.', avatar('1500648767791-00dcc994a43e')],
  ['u2', 'Meera Iyer', 'meerashots', 'meera@example.com', 'user', 'Street and everyday moments from Bengaluru and beyond.', avatar('1494790108377-be9c29b29330')],
  ['u3', 'Lucas Ferreira', 'lucasframes', 'lucas@example.com', 'user', 'Architecture, symmetry and the occasional pigeon.', avatar('1507003211169-0a1dd7228f2d')],
  ['u4', 'Sofia Rossi', 'sofia.lens', 'sofia@example.com', 'user', 'Portraits in window light. Film when I can afford it.', avatar('1438761681033-6461ffad8d80')],
  ['u5', 'Noor Haddad', 'noorwild', 'noor@example.com', 'user', 'Wildlife and quiet corners of the planet.', avatar('1534528741775-53994a69daeb')],
];

// [unsplashId, userId, category, caption, description, tags, aspectRatio, daysAgo]
export const PHOTOS = [
  ['1506744038136-46273834b3fb', 'u1', 'Nature', 'First light over the valley', 'Got up at four to catch the sun spilling across the ridge. Worth every lost hour of sleep.', 'valley,sunrise,mountains', 1.5, 2],
  ['1441974231531-c6227db76b6e', 'u1', 'Nature', 'Sunbeams through the pines', 'The forest floor was dark until the mist lifted and the light came straight down.', 'forest,pines,light', 0.75, 3],
  ['1470071459604-3b5ec3a7fe05', 'u5', 'Nature', 'Fog between the ridges', 'Layers of hills fading into the morning haze.', 'fog,hills,mist', 1.33, 4],
  ['1501785888041-af3ef285b470', 'u1', 'Nature', 'Still water, bigger sky', 'Not a ripple on the lake for ten whole minutes.', 'lake,reflection,calm', 1.5, 5],
  ['1472214103451-9374bd1c798e', 'u5', 'Nature', 'Green hills at golden hour', 'The last twenty minutes of daylight did all the work here.', 'hills,golden hour,landscape', 1, 6],
  ['1426604966848-d7adac402bff', 'u1', 'Nature', 'Blue hour in the high country', 'Cold, quiet and completely worth the climb.', 'blue hour,mountains,dusk', 0.8, 7],
  ['1476514525535-07fb3b4ae5f1', 'u2', 'Travel', 'A lake worth the long drive', 'Eight hours on winding roads, and this was the reward.', 'lake,roadtrip,mountains', 1.33, 3],
  ['1488646953014-85cb44e25828', 'u2', 'Travel', 'Somewhere between two stops', 'Travel days are mostly waiting. This was the best part of the wait.', 'journey,transit,wander', 1.5, 9],
  ['1502602898657-3e91760cbb34', 'u4', 'Travel', 'Evening in the city of light', 'Caught the street lamps just as they came on.', 'paris,evening,city', 0.75, 10],
  ['1507525428034-b723cf961d3e', 'u2', 'Travel', 'Empty beach, early morning', 'Tide out, footprints not yet made.', 'beach,sea,morning', 1.5, 11],
  ['1523906834658-6e24ef2386f9', 'u3', 'Travel', 'Canals and quiet bridges', 'Off the main routes, the city goes quiet.', 'canals,bridges,old town', 0.8, 12],
  ['1469854523086-cc02fe5d8800', 'u1', 'Travel', 'Road trip in golden light', 'Windows down, no plan, a full tank.', 'road,golden hour,journey', 1, 13],
  ['1449824913935-59a10b8d2000', 'u2', 'Street', 'Crossing at rush hour', 'Everyone in a hurry except the light.', 'crossing,city,crowd', 1.33, 1],
  ['1514565131-fce0801e5785', 'u3', 'Street', 'City after the rain', 'Wet pavement turns every neon sign into two.', 'rain,reflection,night', 0.67, 4],
  ['1480714378408-67cf0d13bc1b', 'u2', 'Street', 'Skyline at dusk', 'The moment the offices light up one floor at a time.', 'skyline,dusk,city', 1.5, 6],
  ['1477959858617-67f85cf4f1df', 'u3', 'Street', 'Streets at night', 'Long exposure, steady hands, a lot of patience.', 'night,long exposure,street', 0.8, 8],
  ['1519501025264-65ba15a82390', 'u2', 'Street', 'Bright signs, busy lanes', 'The city never really switches off.', 'signs,lights,urban', 1, 9],
  ['1444723121867-7a241cacace9', 'u3', 'Street', 'Morning commute', 'Grey sky, warm windows, everyone heading somewhere.', 'commute,morning,city', 1.33, 14],
  ['1486406146926-c627a92ad1ab', 'u3', 'Architecture', 'Glass tower, grey sky', 'Shot from the pavement looking straight up.', 'glass,tower,minimal', 0.67, 2],
  ['1511818966892-d7d671e672a2', 'u3', 'Architecture', 'Lines that lead up', 'Repeating shapes pulling the eye to the top.', 'lines,geometry,perspective', 0.8, 5],
  ['1487958449943-2429e8be8625', 'u3', 'Architecture', 'Concrete and curves', 'Brutalism is softer than its reputation.', 'concrete,curves,modern', 1, 7],
  ['1518005020951-eccb494ad742', 'u3', 'Architecture', 'Geometry of a facade', 'Repetition, shadow, and a very patient wait for the clouds.', 'facade,pattern,shadow', 0.75, 10],
  ['1479839672679-a46483c0e7c8', 'u3', 'Architecture', 'Stairs to nowhere', 'An accidental symmetry I could not walk past.', 'stairs,symmetry,design', 1, 15],
  ['1534528741775-53994a69daeb', 'u4', 'Portraits', 'Window light, no flash', 'One window, one reflector, one very good afternoon.', 'portrait,window light,natural', 0.8, 1],
  ['1507003211169-0a1dd7228f2d', 'u4', 'Portraits', 'Quiet confidence', 'We talked for an hour before I picked up the camera.', 'portrait,studio,expression', 0.8, 6],
  ['1438761681033-6461ffad8d80', 'u4', 'Portraits', 'Backlit and smiling', 'Sunset behind her, a touch of fill from the left.', 'portrait,backlight,smile', 0.67, 8],
  ['1500648767791-00dcc994a43e', 'u4', 'Portraits', 'Wind, beard, grey day', 'Overcast skies make the best softbox there is.', 'portrait,overcast,outdoor', 1, 12],
  ['1494790108377-be9c29b29330', 'u4', 'Portraits', 'Soft shadows', 'Turned her half a step toward the window and everything changed.', 'portrait,shadows,soft', 0.75, 16],
  ['1474511320723-9a56873867b5', 'u5', 'Wildlife', 'The fox that watched me back', 'Two hours of waiting. It took four seconds to decide I was boring.', 'fox,wildlife,eyes', 1, 3],
  ['1456926631375-92c8ce872def', 'u5', 'Wildlife', 'Leopard in repose', 'Heat of the day. Nobody was in a hurry.', 'leopard,big cat,safari', 1.33, 7],
  ['1437622368342-7a3d73a34c8f', 'u5', 'Wildlife', 'Patient as ever', 'The slowest subject I have ever photographed, and the easiest.', 'turtle,underwater,calm', 1.5, 11],
  ['1564349683136-77e08dba1ef7', 'u5', 'Wildlife', 'Lunch break', 'He did not look up once in forty minutes.', 'panda,bamboo,wildlife', 0.8, 13],
  ['1494438639946-1ebd1d20bf85', 'u2', 'Minimalism', 'One line, one horizon', 'Sometimes the frame is mostly nothing, on purpose.', 'horizon,minimal,calm', 1.5, 4],
  ['1507090960745-b32f65d3113a', 'u3', 'Minimalism', 'White on white', 'Texture only. No colour required.', 'white,texture,quiet', 0.8, 9],
  ['1553356084-58ef4a67b2a7', 'u2', 'Minimalism', 'A single wall, a single colour', 'Found it on a walk. Came back with a better lens.', 'colour,wall,simple', 1, 17],
  ['1541701494587-cb58502866ab', 'u4', 'Abstract', 'Paint in motion', 'Shot at 1/2000 to freeze what the eye never catches.', 'paint,motion,colour', 0.8, 5],
  ['1557672172-298e090bd0f1', 'u1', 'Abstract', 'Fluid study no. 3', 'Ink and water, a small tank, and a very dark room.', 'fluid,ink,study', 1, 10],
  ['1550859492-d5da9d8e45f3', 'u4', 'Abstract', 'Light leaks', 'Happy accidents from an old lens and a loose hood.', 'light,blur,analog', 1.33, 18],
];

// [title, theme, status, startOffsetDays, deadlineOffsetDays, description]
export const CHALLENGES = [
  ['Reflections', 'Reflections', 'active', -2, 5, 'Puddles, windows, still water, polished metal. Show us the world twice, and make us look at the second one.'],
  ['Everyday Moments', 'Everyday Moments', 'active', -1, 6, 'No travel required. Photograph something ordinary from your day that you would normally walk past.'],
  ['Shadows', 'Shadows', 'closed', -12, -5, 'Let the shadow be the subject. Long, hard, soft or strange, we wanted the dark half of the frame.'],
  ['Colours', 'Colours', 'upcoming', 5, 12, 'Pick one colour and build a photograph around it. The bolder the better.'],
];

// [challengeIndex, photoIndex(1-based, owner is unique per challenge)]
export const SUBMISSIONS = [
  [0, 4], [0, 10], [0, 14], [0, 24],
  [1, 17], [1, 12], [1, 31],
  [2, 16], [2, 13], [2, 25], [2, 3],
];

