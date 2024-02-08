import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';

import Tweet from './tweet';


export default function Timeline() {
    const [tweets, setTweets] = useState([]);
    // const authToken = user?.token;
    const accessToken = localStorage.getItem("access token")
    console.log("accessToken", accessToken)

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tweets/', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
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
