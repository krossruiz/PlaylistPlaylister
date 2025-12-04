'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function PlaylistForm({ initialData = {}, onSubmit, loading, submitLabel = 'Save Playlist' }) {
    const [title, setTitle] = useState(initialData.title || '');
    const [content, setContent] = useState(initialData.content || '');
    const [mode, setMode] = useState('visual'); // 'visual' or 'source'
    const textareaRef = useRef(null);
    const visualEditorRef = useRef(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => { }, placeholder: '' });
    const [modalContent, setModalContent] = useState(null);

    // Sync content when switching modes
    useEffect(() => {
        if (mode === 'visual' && visualEditorRef.current) {
            visualEditorRef.current.innerHTML = content;
        }
    }, [mode]);

    // Initialize visual editor content on mount if in visual mode
    useEffect(() => {
        if (mode === 'visual' && visualEditorRef.current && initialData.content) {
            // Only set if empty to avoid overwriting user edits if re-renders happen
            if (visualEditorRef.current.innerHTML === '') {
                visualEditorRef.current.innerHTML = initialData.content;
            }
        }
    }, [initialData.content]);


    const handleModeToggle = () => {
        if (mode === 'visual') {
            // Switching to source: get HTML from visual editor
            if (visualEditorRef.current) {
                setContent(visualEditorRef.current.innerHTML);
            }
            setMode('source');
        } else {
            // Switching to visual: content is already in state, effect will update innerHTML
            setMode('visual');
        }
    };

    const insertAtCursor = (text) => {
        if (mode === 'source') {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + text + content.substring(end);

            setContent(newContent);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + text.length, start + text.length);
            }, 0);
        } else {
            // Visual mode insertion
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            // Check if selection is inside the editor
            if (!visualEditorRef.current.contains(range.commonAncestorContainer)) {
                visualEditorRef.current.focus();
            }

            // Use execCommand for simplicity in visual mode (or Range API)
            document.execCommand('insertHTML', false, text);
        }
    };

    // Selection saving for mobile
    const savedRangeRef = useRef(null);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (savedRangeRef.current) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }
    };

    const openModal = (title, message, placeholder, callback) => {
        saveSelection();
        setModalConfig({
            title,
            message,
            placeholder,
            onConfirm: (value) => {
                setModalOpen(false);
                if (value) {
                    // Small delay to allow modal to close and focus to return
                    setTimeout(() => {
                        restoreSelection();
                        callback(value);
                    }, 50);
                }
            }
        });
        setModalContent(null); // Reset custom content
        setModalOpen(true);
    };

    const insertYouTube = () => {
        openModal(
            'Insert YouTube Video',
            'Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...):',
            'https://www.youtube.com/watch?v=...',
            (url) => {
                let videoId = '';
                try {
                    const urlObj = new URL(url);
                    if (urlObj.hostname.includes('youtube.com')) {
                        videoId = urlObj.searchParams.get('v');
                    } else if (urlObj.hostname.includes('youtu.be')) {
                        videoId = urlObj.pathname.slice(1);
                    }
                } catch (e) {
                    // Invalid URL
                }

                if (videoId) {
                    const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>&nbsp;`;
                    insertAtCursor(embedCode);
                } else {
                    alert('Invalid YouTube URL');
                }
            }
        );
    };

    const generateThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                video.currentTime = 1; // Capture at 1s
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const insertIPFS = () => {
        saveSelection();
        setModalConfig({
            title: 'Insert Video',
            message: '',
            placeholder: '',
            onConfirm: () => { } // Handled internally by custom content
        });

        const handleUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Generate thumbnail
            let posterUrl = '';
            try {
                const thumbnailBlob = await generateThumbnail(file);
                if (thumbnailBlob) {
                    const thumbFormData = new FormData();
                    thumbFormData.append('file', new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' }));
                    const thumbRes = await fetch('/api/upload', { method: 'POST', body: thumbFormData });
                    if (thumbRes.ok) {
                        const thumbData = await thumbRes.json();
                        posterUrl = thumbData.url;
                    }
                }
            } catch (err) {
                console.error('Thumbnail generation failed:', err);
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                const embedCode = `<video controls width="100%" preload="metadata" ${posterUrl ? `poster="${posterUrl}"` : ''}>
  <source src="${data.url}" type="video/mp4">
  Your browser does not support the video tag.
</video>&nbsp;`;

                setModalOpen(false);
                setTimeout(() => {
                    restoreSelection();
                    insertAtCursor(embedCode);
                }, 50);
            } catch (error) {
                alert('Upload failed: ' + error.message);
            }
        };

        const handleCIDSubmit = (e) => {
            e.preventDefault();
            const cid = e.target.cid.value;
            const poster = e.target.poster.value;
            if (!cid) return;

            let src = cid;
            if (!cid.startsWith('http')) {
                src = `https://ipfs.io/ipfs/${cid}`;
            }

            const embedCode = `<video controls width="100%" preload="metadata" ${poster ? `poster="${poster}"` : ''}>
  <source src="${src}" type="video/mp4">
  Your browser does not support the video tag.
</video>&nbsp;`;

            setModalOpen(false);
            setTimeout(() => {
                restoreSelection();
                insertAtCursor(embedCode);
            }, 50);
        };

        setModalContent(
            <div className="upload-options">
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Option 1: Upload Video</h3>
                    <input type="file" accept="video/*" onChange={handleUpload} className="form-control" />
                    <p className="helper-text">Supported formats: MP4, WebM, Ogg. Thumbnail will be generated automatically.</p>
                </div>

                <div>
                    <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Option 2: IPFS CID or URL</h3>
                    <form onSubmit={handleCIDSubmit}>
                        <input name="cid" type="text" className="form-control" placeholder="Qm... or https://..." style={{ marginBottom: '0.5rem' }} required />
                        <input name="poster" type="text" className="form-control" placeholder="Thumbnail URL (optional)" style={{ marginBottom: '1rem' }} />
                        <div className="modal-actions">
                            <button type="button" className="btn" style={{ background: '#666' }} onClick={() => setModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn">Insert</button>
                        </div>
                    </form>
                </div>
            </div>
        );
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let finalContent = content;
        if (mode === 'visual' && visualEditorRef.current) {
            finalContent = visualEditorRef.current.innerHTML;
        }
        onSubmit({ title, content: finalContent });
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Playlist Title</label>
                    <input
                        type="text"
                        id="title"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="My Awesome Playlist"
                    />
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label htmlFor="content" style={{ marginBottom: 0 }}>Playlist Content</label>
                        <button
                            type="button"
                            onClick={handleModeToggle}
                            style={{
                                background: 'none',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {mode === 'visual' ? 'Switch to Source Code' : 'Switch to Visual Editor'}
                        </button>
                    </div>

                    <div className="toolbar">
                        <button type="button" onClick={insertYouTube}>Insert YouTube</button>
                        <button type="button" onClick={insertIPFS}>Insert IPFS Video</button>
                        <button type="button" onClick={() => insertAtCursor('<a href="LINK_URL">Link</a>')}>Link</button>
                    </div>

                    {mode === 'source' ? (
                        <textarea
                            id="content"
                            ref={textareaRef}
                            className="form-control"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder="Write your playlist here using HTML..."
                        />
                    ) : (
                        <div
                            ref={visualEditorRef}
                            className="form-control"
                            contentEditable
                            style={{ minHeight: '300px', overflowY: 'auto' }}
                            onBlur={() => {
                                if (visualEditorRef.current) {
                                    setContent(visualEditorRef.current.innerHTML);
                                }
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                const text = e.clipboardData.getData('text/plain');
                                document.execCommand('insertText', false, text);
                            }}
                        />
                    )}

                    <p className="helper-text">
                        {mode === 'visual'
                            ? 'You are in Visual Editor mode. Videos will appear as you insert them.'
                            : 'You are in Source Code mode. You can edit the raw HTML.'}
                    </p>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>
            </form>

            <Modal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                placeholder={modalConfig.placeholder}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
            >
                {modalContent}
            </Modal>
        </>
    );
}
