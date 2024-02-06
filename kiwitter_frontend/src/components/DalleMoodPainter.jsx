import React, { useState } from 'react';
import axios from 'axios';

const DalleMoodPainter = () => {
    const [mood, setMood] = useState('');
    const [genre, setGenre] = useState('');
    const [image, setImage] = useState(null);

    // 인기 있는 대표 장르 5가지
    const genres = ['animation', 'Pop Art', 'Minimal Line Art', 'Street Art', 'Splatter Paint', 'cartoon', 'Blog Illustration'];

    const handleMoodChange = (event) => {
        setMood(event.target.value);
    };

    const handleGenreChange = (event) => {
        setGenre(event.target.value);
    };

    const generateImageWithInput = async () => {
        const promptToUse = `${mood} 기분과 ${genre} 장르를 반영한 이미지를 생성해주세요.`;
        console.log('Prompt:', promptToUse);
        await generateImage(promptToUse);
    };

    const generateImageWithAPIPrompt = async () => {
        const generatedPrompt = await generatePrompt();
        await generateImage(generatedPrompt);
    };


    const generatePrompt = async () => {
        const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        const promptText = `${mood} 기분을 가장 잘 나타내면서 ${genre} 장르에 속하는 독특하고 창의적인 이미지를 생성하기 위한 프롬프트를 작성해주세요. 
                            이 이미지는 보는 이로 하여금 해당 기분과 장르의 깊은 이해를 느끼게 해야 합니다.
                            구체적인 텍스트나 인물 사진이 등장하지 않게 해주세요.`

        const messages = [
            { role: 'system', content: '당신은 DALL-E로 이미지를 생성하는 데 사용할 프롬프트를 작성해주는 전문가입니다.' },
            { role: 'user', content: promptText },
        ];

        const data = {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
            temperature: 0.7,
        };

        try {
            const response = await axios.post(apiEndpoint, data, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                }
            });

            const generatedPrompt = response.data.choices[0].message.content.trim();
            return generatedPrompt;
        } catch (error) {
            console.error('Error generating prompt:', error);
            return '';
        }
    };

    const generateImage = async (prompt) => {
        console.log('Prompt:', prompt)
        // const prompt = `${mood} 기분, ${genre} 장르의, 트위터나 인스타그램에 올릴 느낌 있고 사람들의 관심을 사로잡을 수 있는 이미지를 그려줘. 너무 작지도 크지도 않는, 트윗에 포함시킬 정도의 적당한 크기의 이미지.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/images/generations',
                { prompt: prompt, n: 1, size: '512x512' },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setImage(response.data.data[0].url);
        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="오늘의 기분은 어떠신가요?"
                value={mood}
                onChange={handleMoodChange}
            />
            <select value={genre} onChange={handleGenreChange}>
                <option value="">장르 선택...</option>
                {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>
            <button onClick={generateImageWithInput}>그림 그리기 with 내 입력 메시지</button>
            <button onClick={generateImageWithAPIPrompt}>그림 그리기 with 내 입력 메시지 + 추가 프롬프트 작성 요청</button>
            {image && <img src={image} alt="Generated mood" style={{ maxWidth: '100%', height: 'auto' }} />}
        </div>
    );
};

export default DalleMoodPainter;

