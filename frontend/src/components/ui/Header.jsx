import React from 'react';
import PropTypes from 'prop-types';
import { Brain } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-orange-500 mr-3" />
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex-grow"></div>
        <div className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600 font-medium">
          In Progress
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Header;
