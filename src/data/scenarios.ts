/*

This file defines all hardcoded scenarios that ship with the application, 
as well as the special "Senior Engineer" stakeholder used for requirements review

- Hardcoded scenarios are immutable by the user
- Custom scenarios are seperately stored

 */

import { Scenario } from '@/types';

export const defaultScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Book Discussion Platform',
    shortDescription: 'Social reading and literary community',
    fullDescription:
      'A platform where book enthusiasts can discover new reads, join discussion groups, share reviews, and connect with fellow readers. Features include virtual book clubs, reading challenges, and author Q&A sessions.',
    category: 'Social',

    stakeholders: [
      {
        id: 's1',
        name: 'Emily Chen',
        role: 'Book Club Organizer',
        description:
          'Manages multiple book clubs and coordinates reading schedules',
      },
      {
        id: 's2',
        name: 'Marcus Thompson',
        role: 'Casual Reader',
        description:
          'Enjoys discovering new books and reading reviews before purchasing',
      },
      {
        id: 's3',
        name: 'Sarah Williams',
        role: 'Published Author',
        description:
          'Wants to engage with readers and promote upcoming releases',
      },
    ],
  },

  {
    id: '2',
    title: 'Food Delivery Service',
    shortDescription: 'Restaurant-to-door meal delivery',
    fullDescription:
      'A comprehensive food delivery platform connecting local restaurants with hungry customers. Includes real-time order tracking, driver coordination, and restaurant management tools.',
    category: 'Logistics',
    stakeholders: [
      {
        id: 's4',
        name: 'Tony Rodriguez',
        role: 'Restaurant Owner',
        description:
          'Runs a family restaurant and wants to expand customer reach',
      },
      {
        id: 's5',
        name: 'Lisa Park',
        role: 'Delivery Driver',
        description:
          'Part-time driver looking for flexible work with good earnings',
      },
      {
        id: 's6',
        name: 'James Wilson',
        role: 'Hungry Customer',
        description:
          'Busy professional who orders food regularly for convenience',
      },
      {
        id: 's7',
        name: 'Maria Santos',
        role: 'Operations Manager',
        description:
          'Oversees platform performance and driver assignments',
      },
    ],
  },

  {
    id: '3',
    title: 'Fitness Tracking App',
    shortDescription: 'Personal health and workout companion',
    fullDescription:
      'A mobile-first fitness application that helps users track workouts, monitor nutrition, set goals, and connect with personal trainers. Includes wearable device integration and progress analytics.',
    category: 'Health',
    stakeholders: [
      {
        id: 's8',
        name: 'Alex Rivera',
        role: 'Fitness Enthusiast',
        description:
          'Dedicated gym-goer who tracks every workout meticulously',
      },
      {
        id: 's9',
        name: 'Diana Moore',
        role: 'Personal Trainer',
        description:
          'Certified trainer managing multiple clients remotely',
      },
      {
        id: 's10',
        name: 'Ryan Kim',
        role: 'Casual User',
        description:
          'Wants to get more active but needs motivation and guidance',
      },
    ],
  },

  {
    id: '4',
    title: 'Event Ticketing Platform',
    shortDescription: 'Concert and event ticket marketplace',
    fullDescription:
      'An end-to-end ticketing solution for concerts, sports events, and festivals. Features include venue management, dynamic pricing, fraud prevention, and mobile ticket delivery.',
    category: 'Entertainment',
    stakeholders: [
      {
        id: 's11',
        name: 'David Brown',
        role: 'Event Organizer',
        description:
          'Produces concerts and festivals across multiple venues',
      },
      {
        id: 's12',
        name: 'Sophia Lee',
        role: 'Concert Goer',
        description:
          'Attends 10+ shows yearly and values easy ticket purchases',
      },
      {
        id: 's13',
        name: 'Mike Chen',
        role: 'Venue Manager',
        description:
          'Manages a 5000-seat arena and coordinates with promoters',
      },
      {
        id: 's14',
        name: 'Janet Adams',
        role: 'Security Lead',
        description:
          'Ensures event safety and manages entry checkpoints',
      },
    ],
  },

  {
    id: '5',
    title: 'Online Learning Platform',
    shortDescription: 'Interactive education marketplace',
    fullDescription:
      'A comprehensive e-learning platform where instructors can create courses and students can learn at their own pace. Includes video hosting, quizzes, certificates, and discussion forums.',
    category: 'Education',
    stakeholders: [
      {
        id: 's15',
        name: 'Jennifer Taylor',
        role: 'Course Instructor',
        description:
          'University professor creating supplementary online content',
      },
      {
        id: 's16',
        name: 'Kevin Zhang',
        role: 'Student',
        description:
          'Career switcher learning new skills for job advancement',
      },
      {
        id: 's17',
        name: 'Amanda Foster',
        role: 'Content Reviewer',
        description:
          'Ensures course quality and compliance with standards',
      },
    ],
  },

  {
    id: '6',
    title: 'Pet Care Marketplace',
    shortDescription: 'Pet services and supplies hub',
    fullDescription:
      'A one-stop platform for pet owners to find veterinarians, groomers, pet sitters, and purchase supplies. Includes appointment booking, health records, and community features.',
    category: 'Services',
    stakeholders: [
      {
        id: 's18',
        name: 'Robert Hayes',
        role: 'Veterinarian',
        description:
          'Runs a busy veterinary clinic and wants to streamline bookings',
      },
      {
        id: 's19',
        name: 'Linda Martinez',
        role: 'Pet Owner',
        description:
          'Has two dogs and a cat, needs reliable care options',
      },
      {
        id: 's20',
        name: 'Tom Baker',
        role: 'Pet Sitter',
        description:
          'Professional pet sitter offering in-home care services',
      },
    ],
  },
];

export const seniorEngineer = {
  id: 'senior-engineer',
  name: 'Alex Morgan',
  role: 'Senior Software Engineer',
  description:
    'A seasoned software engineer with 15+ years of experience. Reviews requirements for completeness, clarity, and technical feasibility.',
};
