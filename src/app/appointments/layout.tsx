export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">MedAppoint</div>
        <div>
          <a href="/appointments/login" className="text-gray-600 hover:text-blue-600 mr-4">Login</a>
          <a href="/appointments/register" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">Register</a>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
