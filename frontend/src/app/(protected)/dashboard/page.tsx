import ChapterCard from "@/components/chapters/ChapterCard";

export default function Dashboard() {
    const chapters = [
        {
            id: 1,
            title: 'Chapter 1',
            description: 'Chapter 1',
        },
        {
            id: 2,
            title: 'Chapter 2',
            description: 'Chapter 2',
        },
        {
            id: 3,
            title: 'Chapter 3',
            description: 'Chapter 3',
        },
        {
            id: 4,
            title: 'Chapter 4',
            description: 'Chapter 4',
        }
    ]

    return (<div className="p-6">
            {/* Top container */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-600">Here’s what’s going on...</p>
            </div>

            {/* 3-column grid for chapters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Example chapters */}
                {chapters.map((chapter, index) => (
                    <ChapterCard key={chapter.id} chapter={chapter} index={index}/>
                ))}
                {/* Add more chapters as needed */}
            </div>
        </div>
    )
}