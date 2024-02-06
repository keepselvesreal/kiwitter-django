import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const HashtagTweets = () => {
    const { hashtag } = useParams();
    const [tweets, setTweets] = useState([]);

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/hashtags/${hashtag}/tweets/`);
                console.log("hashtag response", response)
                setTweets(response.data);
            } catch (error) {
                console.error('Error fetching tweets by hashtag:', error);
            }
        };

        fetchTweets();
    }, [hashtag]);

    return (
        <div>
            <h2>#{hashtag}</h2>
            {tweets.map(tweet => (
                <div key={tweet.id}>
                    <p>{tweet.author.username}</p>
                    <p>{tweet.content}</p>
                </div>
            ))}
        </div>
    );
};

export default HashtagTweets;
