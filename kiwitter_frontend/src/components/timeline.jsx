import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';

import Tweet from './tweet';


export default function Timeline() {
    const [tweets, setTweets] = useState([]);
    const { user } = useUserContext();
    const authToken = user?.token;
    // const authToken = localStorage.getItem('token');

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tweets/', {
                    headers: { 'Authorization': `Token ${authToken}` }
                });
                setTweets(response.data);
            } catch (error) {
                console.error('Error fetching tweets', error);
            }
        };

        fetchTweets();
    }, []);

    return (
        <div>
            {tweets.map(tweet => (
                <Tweet key={tweet.id} {...tweet} />
            ))}
        </div>
    );
}
