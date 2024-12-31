
import { useState, useEffect } from 'react';

import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';

import { db } from '../config/firebase';



export interface Poll extends DocumentData {

  id: string;

  question: string;

  options: Array<{

    id: string;

    text: string;

    votes: number;

    voters: string[];

  }>;

  createdAt: string;

  totalVotes: number;

  authorId: string;

  authorName: string;

  visibility: 'public' | 'private';

  shareId: string | null;

}



export function usePolls() {

  const [polls, setPolls] = useState<Poll[]>([]);

  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {

    const q = query(

      collection(db, 'polls'),

      where('visibility', '==', 'public')

    );



    const unsubscribe = onSnapshot(q, (querySnapshot) => {

      const pollsData = querySnapshot.docs.map(doc => ({

        ...doc.data(),

        id: doc.id

      })) as Poll[];

      setPolls(pollsData);

      setIsLoading(false);

    });



    return () => unsubscribe();

  }, []);



  return { polls, isLoading };

}
