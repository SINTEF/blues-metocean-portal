import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';

function CodeBox(props: { text: string,customStyle?: React.CSSProperties | undefined }) {
    const { text,customStyle } = props;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copy(text);
        setCopied(true);
    }

    useEffect(() => {
        setCopied(false);
    }, [text]);

    // <?xml version="1.0" ?><svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 3)"><path d="m6.5 11.5-3-3 3-3"/><path d="m3.5 8.5h11"/><path d="m12.5 6.5v-4.00491374c0-.51283735-.3860402-.93550867-.8833789-.99327378l-.1190802-.00672622-1.9975409.00491374m-6 0-1.99754087-.00492752c-.51283429-.00124584-.93645365.38375378-.99544161.88094891l-.00701752.11906329v10.99753792c.00061497.5520447.44795562.9996604 1 1.0006148l10 .0061554c.5128356.0008784.9357441-.3848611.993815-.8821612l.006185-.1172316v-2.5"/><path d="m4.5.5h4c.55228475 0 1 .44771525 1 1s-.44771525 1-1 1h-4c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1z"/></g></svg>
    return (
        <div>
            <SyntaxHighlighter language="python" style={atomOneDark} customStyle={customStyle}>
                {text}
            </SyntaxHighlighter>
            <div>
                <button onClick={handleCopy}><ContentPasteGoIcon fontSize='small' /></button>
                {copied ? <span> Copied!</span> : null}
            </div>
        </div>
    );
}

export default CodeBox;



