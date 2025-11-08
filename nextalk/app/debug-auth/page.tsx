// "use client";

// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function DebugAuthPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [dbUsers, setDbUsers] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/users");
//         const users = await res.json();
//         setDbUsers(users);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       }
//     };
//     fetchUsers();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <h1 className="text-3xl font-bold text-gray-900">Auth Debug Info</h1>

//         {/* Session Status */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">Session Status</h2>
//           <p className="mb-2">
//             <span className="font-medium">Status:</span>{" "}
//             <span
//               className={`px-2 py-1 rounded ${
//                 status === "authenticated"
//                   ? "bg-green-100 text-green-800"
//                   : status === "loading"
//                   ? "bg-yellow-100 text-yellow-800"
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {status}
//             </span>
//           </p>
//         </div>

//         {/* Session User Info */}
//         {session?.user && (
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">
//               Current Session User (NextAuth)
//             </h2>
//             <div className="space-y-2">
//               <p>
//                 <span className="font-medium">ID:</span>{" "}
//                 <code className="bg-gray-100 px-2 py-1 rounded">
//                   {session.user.id || "NOT SET"}
//                 </code>
//               </p>
//               <p>
//                 <span className="font-medium">Name:</span>{" "}
//                 {session.user.name || "NOT SET"}
//               </p>
//               <p>
//                 <span className="font-medium">Email:</span>{" "}
//                 {session.user.email || "NOT SET"}
//               </p>
//               <p>
//                 <span className="font-medium">Image:</span>{" "}
//                 {session.user.image ? (
//                   <img
//                     src={session.user.image}
//                     alt="User"
//                     className="inline-block w-10 h-10 rounded-full ml-2"
//                   />
//                 ) : (
//                   "NOT SET"
//                 )}
//               </p>
//             </div>

//             {/* Full Session Object */}
//             <details className="mt-4">
//               <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
//                 View Full Session Object
//               </summary>
//               <pre className="mt-2 p-4 bg-gray-50 rounded overflow-auto text-xs">
//                 {JSON.stringify(session, null, 2)}
//               </pre>
//             </details>
//           </div>
//         )}

//         {/* Database Users */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">
//             Users in Database ({dbUsers.length})
//           </h2>
//           <div className="space-y-3">
//             {dbUsers.map((user) => (
//               <div
//                 key={user.id}
//                 className={`p-3 border rounded ${
//                   session?.user?.id === user.id
//                     ? "border-green-500 bg-green-50"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <p>
//                   <span className="font-medium">ID:</span>{" "}
//                   <code className="bg-gray-100 px-2 py-1 rounded text-xs">
//                     {user.id}
//                   </code>
//                   {session?.user?.id === user.id && (
//                     <span className="ml-2 text-green-600 font-semibold">
//                       ← CURRENT USER
//                     </span>
//                   )}
//                 </p>
//                 <p>
//                   <span className="font-medium">Name:</span> {user.name}
//                 </p>
//                 <p>
//                   <span className="font-medium">Email:</span> {user.email}
//                 </p>
//                 <p>
//                   <span className="font-medium">Image:</span>{" "}
//                   {user.image ? (
//                     <img
//                       src={user.image}
//                       alt={user.name}
//                       className="inline-block w-8 h-8 rounded-full ml-2"
//                     />
//                   ) : (
//                     "None"
//                   )}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold mb-4">Actions</h2>
//           <div className="flex gap-3">
//             <button
//               onClick={() => router.push("/chat")}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Go to Chat
//             </button>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//             >
//               Reload Page
//             </button>
//             <button
//               onClick={() => signOut({ callbackUrl: "/signin" })}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>

//         {/* Diagnostic Info */}
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//           <h2 className="text-xl font-semibold mb-4 text-yellow-800">
//             Diagnostic Checks
//           </h2>
//           <div className="space-y-2 text-sm">
//             <p>
//               ✓ Session exists:{" "}
//               <span className="font-mono">{session ? "✅ Yes" : "❌ No"}</span>
//             </p>
//             <p>
//               ✓ User ID in session:{" "}
//               <span className="font-mono">
//                 {session?.user?.id ? "✅ Yes" : "❌ No"}
//               </span>
//             </p>
//             <p>
//               ✓ User email in session:{" "}
//               <span className="font-mono">
//                 {session?.user?.email ? "✅ Yes" : "❌ No"}
//               </span>
//             </p>
//             <p>
//               ✓ Database has users:{" "}
//               <span className="font-mono">
//                 {dbUsers.length > 0 ? "✅ Yes" : "❌ No"}
//               </span>
//             </p>
//             <p>
//               ✓ Session user matches DB user:{" "}
//               <span className="font-mono">
//                 {session?.user?.id &&
//                 dbUsers.some((u) => u.id === session.user.id)
//                   ? "✅ Yes"
//                   : "❌ No"}
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
