function StatCard({ title, value, description }) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">{title}</p>
  
        <h3 className="mt-3 text-3xl font-bold text-[#40291F]">
          {value}
        </h3>
  
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    );
  }
  
  export default StatCard;