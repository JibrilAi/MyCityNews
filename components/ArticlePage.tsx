
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
);
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
);
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const AudioLoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent border-solid rounded-full animate-spin"></div>
);


const ActionButton: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white transition-colors">
        {children}
        <span className="text-sm font-semibold">{label}</span>
    </button>
);

interface Comment {
    author: string;
    text: string;
    date: string;
}

interface ArticlePageProps {
    article: Article;
    relatedArticles: Article[];
    sourceArticles: Article[];
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ article, relatedArticles, sourceArticles }) => {
    const subheadline = article.description.split('. ')[0] + '.';
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isAudioPaused, setIsAudioPaused] = useState(false);

    // Effect for handling SEO schema
    useEffect(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
            },
            "headline": article.title,
            "image": [
                article.image || `https://placehold.co/800x600/667eea/ffffff?text=MyCityNews&font=lora`
            ],
            "datePublished": article.published,
            "dateModified": article.fetched_at,
            "author": {
                "@type": "Person",
                "name": article.author || "MyCityNews Staff"
            },
            "publisher": {
                "@type": "Organization",
                "name": "MyCityNews.ca",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://placehold.co/600x60/00529B/FFFFFF?text=MyCityNews.ca&font=lora"
                }
            },
            "description": article.description
        };

        const scriptId = 'article-schema';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = scriptId;
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(schema);

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                document.head.removeChild(scriptToRemove);
            }
        };
    }, [article]);
    
    // Effect for cleaning up audio on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            const comment: Comment = {
                author: 'Anonymous', 
                text: newComment.trim(),
                date: new Date().toISOString(),
            };
            setComments(prevComments => [...prevComments, comment]);
            setNewComment('');
        }
    };

    const handleListenClick = () => {
        if (isAudioPlaying) {
            window.speechSynthesis.pause();
            setIsAudioPlaying(false);
            setIsAudioPaused(true);
            return;
        }

        if (isAudioPaused) {
            window.speechSynthesis.resume();
            setIsAudioPlaying(true);
            setIsAudioPaused(false);
            return;
        }

        if (!isAudioLoading) {
            setIsAudioLoading(true);
            const textToSpeak = `${article.title}. ${article.description}`;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            utterance.onstart = () => {
                setIsAudioLoading(false);
                setIsAudioPlaying(true);
                setIsAudioPaused(false);
            };

            utterance.onend = () => {
                setIsAudioLoading(false);
                setIsAudioPlaying(false);
                setIsAudioPaused(false);
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                setIsAudioLoading(false);
                setIsAudioPlaying(false);
                setIsAudioPaused(false);
            };

            window.speechSynthesis.cancel(); 
            window.speechSynthesis.speak(utterance);
        }
    };


    return (
        <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Link to="/" className="hover:underline inline-flex items-center">
                    <BackIcon /> Back
                </Link>
                <span className="mx-2">&gt;</span>
                <Link to={`/category/${encodeURIComponent(article.category)}`} className="hover:underline capitalize">{article.category}</Link>
            </div>

            <article>
                <header className="mb-8 border-b pb-6 dark:border-gray-700">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 dark:text-white leading-tight mb-3">{article.title}</h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">{subheadline}</p>
                    <div className="mt-4 text-gray-500 dark:text-gray-400 flex flex-wrap items-center text-sm gap-x-4 gap-y-2">
                        <span>By <strong>{article.author || "MyCityNews Staff"}</strong></span>
                        <span>{new Date(article.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-gray-400 dark:text-gray-500">|</span>
                        <span>5 min read</span>
                    </div>
                     <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <ActionButton label="Share"><ShareIcon/></ActionButton>
                        <ActionButton label="Save"><SaveIcon/></ActionButton>
                        <ActionButton label="Print"><PrintIcon/></ActionButton>
                        <button 
                            onClick={handleListenClick}
                            disabled={isAudioLoading}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isAudioLoading ? <AudioLoadingSpinner /> : (isAudioPlaying ? <PauseIcon /> : <PlayIcon />)}
                            <span className="text-sm font-semibold">
                                {isAudioLoading ? 'Loading...' : (isAudioPlaying ? 'Pause' : (isAudioPaused ? 'Resume' : 'Listen'))}
                            </span>
                        </button>
                    </div>
                </header>

                {article.image && (
                    <figure className="mb-8">
                        <img src={article.image} alt={article.title} className="w-full h-auto object-cover rounded-lg shadow-lg" />
                        <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">A caption describing the image goes here.</figcaption>
                    </figure>
                )}

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                    <p>{article.description}</p>
                     <p>Article content continues here... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.</p>
                </div>

                {article.url && !article.url.startsWith('#') && (
                    <div className="my-8">
                        <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-brand-red text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                        >
                            Read Full Story on {article.source}
                        </a>
                    </div>
                )}
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="mt-16 border-t dark:border-gray-700 pt-8">
                    <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedArticles.map(related => (
                            <ArticleCard key={related.id} article={related} />
                        ))}
                    </div>
                </section>
            )}

            {/* More from this source */}
            {sourceArticles.length > 0 && (
                <section className="mt-16 border-t dark:border-gray-700 pt-8">
                    <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">More from {article.source}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {sourceArticles.map(sourceArticle => (
                            <ArticleCard key={sourceArticle.id} article={sourceArticle} />
                        ))}
                    </div>
                </section>
            )}

            {/* Comments Section */}
            <section className="mt-16 border-t dark:border-gray-700 pt-8">
                <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</h2>
                <form onSubmit={handleCommentSubmit} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
                    <textarea 
                        placeholder="Add your comment..."
                        className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <button type="submit" className="mt-4 bg-brand-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400" disabled={!newComment.trim()}>
                        Post Comment
                    </button>
                </form>

                <div className="space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <div key={index} className="flex space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                    {comment.author.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center space-x-2">
                                        <p className="font-semibold">{comment.author}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(comment.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Be the first to comment.</p>
                    )}
                </div>
            </section>
        </div>
    );
};
