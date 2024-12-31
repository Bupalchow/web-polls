import { Poll } from '../types';

export const savePolls = (polls: Poll[]) => {
  localStorage.setItem('polls', JSON.stringify(polls));
};

export const getPolls = (): Poll[] => {
  const polls = localStorage.getItem('polls');
  return polls ? JSON.parse(polls) : [];
};

export const savePoll = (poll: Poll) => {
  const polls = getPolls();
  polls.push(poll);
  savePolls(polls);
};