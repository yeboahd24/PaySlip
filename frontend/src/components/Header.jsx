export default function Header() {
  return (
    <header className="bg-ghana-green text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Ghana Take-Home Pay Calculator
          </h1>
          <p className="text-sm text-green-200">
            Monthly PAYE, SSNIT &amp; Pension Breakdown
          </p>
        </div>
        <span className="bg-ghana-gold text-ghana-green font-bold text-sm px-3 py-1 rounded-full">
          GHS
        </span>
      </div>
    </header>
  );
}
