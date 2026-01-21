import React, { useEffect, useState } from "react";

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch("api/chat/online-users");
                if (!response.ok)
                    throw new Error("Failed to fetch online users");  
                const data = await response.json();
                setUsers(data.users || []);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div>Loading online users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Online Users</h2>
            {users.length === 0 ? (
                <div>No users online.</div>
            ) : (
                <ul>
                    {users.map((id) => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UsersList;