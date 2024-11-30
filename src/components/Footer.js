import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-md border-t border-gray-300 py-4">
  <div className="flex flex-col items-center space-y-2">
    <div className="mb-1">
      <img
        src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g transform='translate(50,50)'><circle cx='0' cy='-30' r='10' fill='black'/><circle cx='30' cy='0' r='10' fill='black'/><circle cx='0' cy='30' r='10' fill='black'/><circle cx='-30' cy='0' r='10' fill='black'/><circle cx='0' cy='0' r='6' fill='black'/></g></svg>"
        alt="Logo"
        className="w-6 h-6"
      />
    </div>
    <p className="text-gray-700 text-sm font-semibold">© 2024 USOF</p>
  </div>
</footer>

  );
};

export default Footer;
