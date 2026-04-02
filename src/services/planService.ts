import { UserProfile, Plan, Exercise } from '../types';

const CALISTHENICS_EXERCISES: Record<string, Exercise[]> = {
  Beginner: [
    { name: 'Incline Push-ups', sets: '3', reps: '10-12', desc: 'Hands on an elevated surface.' },
    { name: 'Assisted Squats', sets: '3', reps: '15', desc: 'Hold onto a pole for balance if needed.' },
    { name: 'Plank', sets: '3', reps: '30s', desc: 'Keep your core tight and back flat.' },
    { name: 'Wall Sits', sets: '3', reps: '30s', desc: 'Back against the wall, thighs parallel to floor.' }
  ],
  Intermediate: [
    { name: 'Standard Push-ups', sets: '4', reps: '15-20', desc: 'Full range of motion, chest to floor.' },
    { name: 'Pull-ups', sets: '4', reps: '5-8', desc: 'Overhand grip, chin over bar.' },
    { name: 'Dips', sets: '4', reps: '10-12', desc: 'On parallel bars, lean forward for chest.' },
    { name: 'Lunges', sets: '4', reps: '12 per leg', desc: 'Keep torso upright, knee almost touches floor.' }
  ],
  Advanced: [
    { name: 'Muscle-ups', sets: '5', reps: '3-5', desc: 'Explosive pull into a dip.' },
    { name: 'Handstand Push-ups', sets: '4', reps: '5-8', desc: 'Against a wall or freestanding.' },
    { name: 'Pistol Squats', sets: '4', reps: '8 per leg', desc: 'Single leg squat, other leg extended.' },
    { name: 'Front Lever Progressions', sets: '5', reps: '10s hold', desc: 'Tuck or advanced tuck position.' }
  ]
};

const NUTRITION_PLANS: Record<string, any> = {
  'Mass': {
    breakfast: 'Oatmeal with protein powder, peanut butter, and banana.',
    lunch: 'Chicken breast with brown rice, avocado, and mixed vegetables.',
    snack: 'Greek yogurt with nuts and honey.',
    dinner: 'Salmon with sweet potato and steamed broccoli.'
  },
  'Fat Loss': {
    breakfast: 'Egg white omelet with spinach and tomatoes.',
    lunch: 'Grilled turkey salad with plenty of greens and olive oil dressing.',
    snack: 'Apple with a handful of almonds.',
    dinner: 'White fish with asparagus and a small portion of quinoa.'
  },
  'Performance': {
    breakfast: 'Whole grain toast with avocado and poached eggs.',
    lunch: 'Lean beef stir-fry with colorful peppers and buckwheat noodles.',
    snack: 'Protein shake with mixed berries.',
    dinner: 'Lentil soup with a side of grilled chicken and kale.'
  }
};

const MENTAL_MISSIONS = [
  'Read 10 pages of a non-fiction book.',
  'Meditate for 10 minutes.',
  'Write down 3 things you are grateful for.',
  'Take a 15-minute walk without your phone.',
  'Drink 3 liters of water today.',
  'No social media for the first hour of the day.',
  'Cold shower for 2 minutes.'
];

export function generateDailyPlan(user: UserProfile, date: string): Plan {
  const level = user.physicalLevel || 'Beginner';
  const goal = user.goal || 'Performance';
  
  // Deterministic selection based on date string to keep it consistent for the day
  const dateHash = date.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mentalMission = MENTAL_MISSIONS[dateHash % MENTAL_MISSIONS.length];
  
  return {
    date,
    nutrition: NUTRITION_PLANS[goal] || NUTRITION_PLANS['Performance'],
    workout: {
      exercises: CALISTHENICS_EXERCISES[level] || CALISTHENICS_EXERCISES['Beginner']
    },
    mentalMission
  };
}
