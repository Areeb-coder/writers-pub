import { Feather } from 'lucide-react';

export const AuthBrand = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
      {/* This is a sleek icon box */}
      <div className="p-3 bg-blue-600 rounded-xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
        <Feather className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Writers <span className="text-blue-600">Pub</span>
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          The premium ecosystem for authors.
        </p>
      </div>
    </div>
  );
};