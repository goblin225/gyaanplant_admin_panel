import { Card } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';

const leaderboardData = [
    { id: 1, name: 'Jacob Wittenberg', points: 70, rank: 1, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D' },
    { id: 2, name: 'Xiang Chen', points: 70, rank: 2, avatar: 'https://www.shutterstock.com/image-photo/close-head-shot-confident-serious-600nw-1481322794.jpg' },
    { id: 3, name: 'Gulnaar Kaur', points: 55, rank: 3, avatar: 'https://media.istockphoto.com/id/1394637422/photo/confident-handsome-30s-caucasian-millennial-man-businessman.jpg?s=612x612&w=0&k=20&c=yAaiBJ7NNX1dC2XE-HZecZkUF62f-J-ypKiIT_xn7eA=' },
    { id: 4, name: 'Annalise Muller', points: 50, rank: 4, avatar: 'https://www.aipassportphotos.com/blog/wp-content/uploads/2023/09/image-31-1024x683.png' },
    { id: 5, name: 'Pierre Martin', points: 50, rank: 5, avatar: 'https://www.aipassportphotos.com/blog/wp-content/uploads/2023/09/image-31-1024x683.png' },
    { id: 6, name: 'Celia Rose', points: 50, rank: 6, avatar: 'https://www.aipassportphotos.com/blog/wp-content/uploads/2023/09/image-31-1024x683.png' },
    { id: 7, name: 'Asha Carer', points: 45, rank: 7, avatar: 'https://www.aipassportphotos.com/blog/wp-content/uploads/2023/09/image-31-1024x683.png' },
    { id: 8, name: 'Deniz Tabak', points: 45, rank: 8, avatar: 'https://www.aipassportphotos.com/blog/wp-content/uploads/2023/09/image-31-1024x683.png' }
];

const LeaderBoard = () => {

    const topThree = leaderboardData.slice(0, 3);
    const others = leaderboardData.slice(3);

    const columns = [
        {
            header: 'Profile',
            accessor: 'profilePic',
            cell: (row) => (
                <img
                    src={row?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                />
            ),
        },
        { header: 'Name', accessor: (row) => row.name || 'Guest User' },
        {
            header: 'Points',
            accessor: (row) => `${row.points} pts`
        },
        { header: 'Rank', accessor: (row) => row.rank },
    ]

    return (
        <div className="mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

            <div className="flex flex-col sm:flex-row justify-around items-center mb-8 gap-4">
                {topThree.map((user, index) => (
                    <div key={user.id} className="flex flex-col items-center">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-20 h-20 rounded-full border-4 border-blue-400"
                        />
                        <p className="mt-2 font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.points} pts</p>
                        <span className="mt-1 text-sm font-medium text-gray-500">Rank #{user.rank}</span>
                    </div>
                ))}
            </div>

            <Card className="p-4">
                <DataTable
                    data={others}
                    columns={columns}
                    searchable={true}
                    searchField="companyName"
                // isLoading={isLoading}
                />
            </Card>
        </div>
    );
};

export default LeaderBoard;