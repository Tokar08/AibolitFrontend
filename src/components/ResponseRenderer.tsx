import React from "react";

interface ContentItem {
    type: string;
    text: string;
}

interface ResponseRendererProps {
    content: ContentItem[] | null;
    externalLinks?: string[];
    provider: "openai" | "external";
}

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ content, externalLinks, provider }) => {
    if (provider === "external" && externalLinks) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6 mt-4 border border-gray-200">
                <p className="mb-4 text-gray-800 leading-relaxed text-lg">
                    Ці результати отримані з американської бібліотеки MedlinePlus. Рекомендуємо
                    скористатися браузером із перекладачем для зручності читання.
                </p>
                <ul className="list-disc ml-6">
                    {externalLinks.map((link, index) => {
                        const [url, title] = link.split(",");
                        return (
                            <li key={index} className="mb-2 text-blue-600 underline">
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {title}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    if (provider === "openai" && content) {
        const parseText = (text: string) => {
            const regex = /\*\*(.*?)\*\*|\*(.*?)\*/g;
            const parts: React.ReactNode[] = [];
            let lastIndex = 0;

            text.replace(regex, (match, bold, italic, offset) => {
                if (lastIndex < offset) {
                    parts.push(<span key={lastIndex}>{text.substring(lastIndex, offset)}</span>);
                }

                if (bold) {
                    parts.push(
                        <strong key={offset} className="font-semibold text-black">
                            {bold}
                        </strong>
                    );
                }

                if (italic) {
                    parts.push(
                        <span key={offset} className="italic text-gray-700">
                            {italic}
                        </span>
                    );
                }

                lastIndex = offset + match.length;
                return match;
            });

            if (lastIndex < text.length) {
                parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
            }

            return parts;
        };

        return (
            <div className="bg-white shadow-lg rounded-lg p-6 mt-4 border border-gray-200">
                {content.map((item, index) => {
                    if (item.type === "Paragraph") {
                        return (
                            <p className="mb-4 text-gray-800 leading-relaxed text-lg" key={index}>
                                {parseText(item.text)}
                            </p>
                        );
                    }
                    if (item.type === "ListItem") {
                        const listItems = item.text.split("\n").map((listText, idx) => {
                            const cleanedText = listText.trim().replace(/^\*\s*/, "");
                            return (
                                <li key={idx} className="mb-2 text-gray-800 text-lg">
                                    {parseText(cleanedText)}
                                </li>
                            );
                        });
                        return <ul className="list-disc ml-6" key={index}>{listItems}</ul>;
                    }
                    if (item.type === "Reminder") {
                        return (
                            <div
                                key={index}
                                className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-gray-800"
                            >
                                {parseText(item.text)}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }

    return null;
};

export default ResponseRenderer;
