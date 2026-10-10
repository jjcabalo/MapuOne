const fs = require('fs');

function fixFile(filePath, emptyMessage) {
  let file = fs.readFileSync(filePath, 'utf8');

  const target = `            {filteredCases.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-500 font-medium">${emptyMessage}</div>
            )}
          </div>
        </>`;

  const replacement = `            {filteredCases.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-500 font-medium">${emptyMessage}</div>
            )}

            {totalPages > 1 && !isLoading && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * rowsPerPage, filteredCases.length)}</span> of <span className="font-bold">{filteredCases.length}</span> cases
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>`;

  file = file.replace(target, replacement);
  fs.writeFileSync(filePath, file);
}

fixFile('src/app/(dashboard)/admin/queue/page.tsx', 'No cases match your criteria.');
fixFile('src/app/(dashboard)/admin/my-tickets/page.tsx', "You don't have any tickets assigned to you matching these criteria.");
console.log('Done!');
