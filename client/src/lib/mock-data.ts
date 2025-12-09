export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'agent' | 'admin' | 'customer';
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: string;
  internal: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer: User;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'customer',
    avatar: 'https://i.pravatar.cc/150?u=alice'
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'agent',
    avatar: 'https://i.pravatar.cc/150?u=bob'
  },
  {
    id: 'u3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'agent',
    avatar: 'https://i.pravatar.cc/150?u=charlie'
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'T-1024',
    subject: 'Cannot access the reporting module',
    description: 'I am trying to export the monthly report but getting a 500 error every time I click the button.',
    status: 'open',
    priority: 'high',
    customer: MOCK_USERS[0],
    createdAt: '2023-10-25T09:30:00Z',
    updatedAt: '2023-10-25T09:30:00Z',
    tags: ['bug', 'reporting']
  },
  {
    id: 'T-1025',
    subject: 'Feature request: Dark mode',
    description: 'It would be great if we could have a dark mode for the dashboard.',
    status: 'in_progress',
    priority: 'low',
    customer: { ...MOCK_USERS[0], name: 'David Lee', email: 'david@example.com' },
    assignee: MOCK_USERS[1],
    createdAt: '2023-10-24T14:15:00Z',
    updatedAt: '2023-10-25T10:00:00Z',
    tags: ['feature', 'ui']
  },
  {
    id: 'T-1026',
    subject: 'Billing inquiry',
    description: 'I was charged twice for this month\'s subscription.',
    status: 'resolved',
    priority: 'urgent',
    customer: { ...MOCK_USERS[0], name: 'Eva Green', email: 'eva@example.com' },
    assignee: MOCK_USERS[2],
    createdAt: '2023-10-20T11:00:00Z',
    updatedAt: '2023-10-21T16:45:00Z',
    tags: ['billing']
  },
  {
    id: 'T-1027',
    subject: 'Integration with Slack',
    description: 'How do I set up the Slack integration?',
    status: 'open',
    priority: 'medium',
    customer: { ...MOCK_USERS[0], name: 'Frank White', email: 'frank@example.com' },
    createdAt: '2023-10-26T08:00:00Z',
    updatedAt: '2023-10-26T08:00:00Z',
    tags: ['question', 'integration']
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    ticketId: 'T-1024',
    senderId: 'u1',
    content: 'I am trying to export the monthly report but getting a 500 error every time I click the button.',
    createdAt: '2023-10-25T09:30:00Z',
    internal: false
  },
  {
    id: 'm2',
    ticketId: 'T-1024',
    senderId: 'u2',
    content: 'Hi Alice, thanks for reporting this. Can you tell me which browser you are using?',
    createdAt: '2023-10-25T09:45:00Z',
    internal: false
  },
  {
    id: 'm3',
    ticketId: 'T-1024',
    senderId: 'u2',
    content: 'Checking the logs, it seems like a timeout issue on the database side.',
    createdAt: '2023-10-25T09:50:00Z',
    internal: true
  }
];
