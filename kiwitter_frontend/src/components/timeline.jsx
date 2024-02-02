// Timeline 컴포넌트
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './tweet';


export default function Timeline() {
    const [tweets, setTweets] = useState([]);
    const authToken = localStorage.getItem('token');

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
