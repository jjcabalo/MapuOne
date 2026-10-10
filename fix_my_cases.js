const fs = require('fs');

let file = fs.readFileSync('src/app/(dashboard)/user/my-cases/page.tsx', 'utf8');

// 1. Replace the timelineItems array
const target1 = `                  {(() => {
                    const timelineItems = [
                      { type: 'opened', timestamp: new Date(selectedCase.created_at).getTime(), data: null },
                      ...activities.filter(a => !a.action_text.startsWith('CASE OPENED')).map(a => ({ type: 'activity', timestamp: new Date(a.created_at).getTime(), data: a }))
                    ];`;
                    
const replacement1 = `                  {(() => {
                    const latestMessageTime = comments.length > 0 ? new Date(comments[comments.length - 1].created_at).getTime() : new Date(selectedCase.created_at).getTime() + 1;
                    const timelineItems = [
                      { type: 'opened', timestamp: new Date(selectedCase.created_at).getTime(), data: null },
                      ...activities.filter(a => !a.action_text.startsWith('CASE OPENED')).map(a => ({ type: 'activity', timestamp: new Date(a.created_at).getTime(), data: a })),
                      { type: 'messages_box', timestamp: latestMessageTime, data: null }
                    ];`;
                    
file = file.replace(target1, replacement1);

// 2. Add the `else` block to `timelineItems.map`
const target2 = `                          <div key={act.id} className="relative pl-6 pb-10">
                            <div className={\`absolute -left-[9px] top-1 w-4 h-4 \${getActivityColor(act.action_text)} rounded-full border-[3px] border-white shadow-sm\`}></div>
                            <p className="font-bold text-black text-sm">{renderActionText(act.action_text)}</p>
                            <p className="text-gray-500 text-[11px] mt-1">{new Date(act.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
`;

const replacement2 = `                          <div key={act.id} className="relative pl-6 pb-10">
                            <div className={\`absolute -left-[9px] top-1 w-4 h-4 \${getActivityColor(act.action_text)} rounded-full border-[3px] border-white shadow-sm\`}></div>
                            <p className="font-bold text-black text-sm">{renderActionText(act.action_text)}</p>
                            <p className="text-gray-500 text-[11px] mt-1">{new Date(act.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        );
                      } else {
                        return (
                          <div key="messages_box" className="relative pl-6 flex flex-col pb-10">
                            <div className="absolute -left-[9px] top-2 w-4 h-4 bg-gray-800 rounded-full border-[3px] border-white shadow-sm"></div>
                            <h2 className="font-black text-black uppercase text-sm tracking-wide mb-4 mt-2">Messages</h2>
                            
                            <div className="flex flex-col gap-6 relative overflow-y-auto max-h-[400px] custom-scrollbar pr-4 py-2">
                              {comments.map(c => {
                                const isMe = c.user_id === currentUser?.id;
                                let authorName = '';
                                if (isMe) {
                                  authorName = 'YOU';
                                } else {
                                  const role = c.users?.role || '';
                                  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                                    authorName = \`\${c.users?.first_name} \${c.users?.last_name} > MapuOne Admin\`;
                                  } else if (role === 'HANDLER') {
                                    authorName = \`\${c.users?.first_name} \${c.users?.last_name} > \${c.users?.department || 'Handler'}\`;
                                  } else {
                                    authorName = \`\${c.users?.first_name} \${c.users?.last_name}\`;
                                  }
                                }

                                return (
                                  <div key={c.id} className={\`flex w-full \${isMe ? 'justify-end' : 'justify-start'}\`}>
                                    <div className={\`\${isMe ? 'bg-white' : 'bg-[#F8F6F9]'} rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200 max-w-[90%] md:max-w-[80%]\`}>
                                      <div className={\`flex justify-between items-center mb-2 gap-4 \${isMe ? 'flex-row-reverse' : ''}\`}>
                                        <div className="flex items-center gap-2">
                                          <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-black" />
                                          <span className="font-black text-black text-xs md:text-sm">{authorName.toUpperCase()}</span>
                                        </div>
                                        <span className="text-gray-500 text-[10px] md:text-[11px] whitespace-nowrap">
                                          {new Date(c.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className={\`text-gray-800 text-sm leading-relaxed \${isMe ? 'mr-7 md:mr-8 text-right' : 'ml-7 md:ml-8'}\`}>
                                        {c.message}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                              {comments.length === 0 && (
                                <p className="text-gray-500 text-xs italic">No messages yet.</p>
                              )}
                              
                              {(selectedCase.rawStatus !== 'RESOLVED' || (selectedCase.rawStatus === 'RESOLVED' && comments.length > 0)) && (
                                <div className="mt-4 flex flex-col gap-2 relative">
                                  <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={selectedCase.rawStatus === 'RESOLVED' || isSending}
                                    placeholder={selectedCase.rawStatus === 'RESOLVED' ? "Case is resolved. No new messages can be sent." : "Type your message..."}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm min-h-[100px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                  {selectedCase.rawStatus !== 'RESOLVED' && (
                                    <button 
                                      onClick={handleSendComment}
                                      disabled={isSending || !newComment.trim()}
                                      className="self-end px-6 py-2 bg-[#E50000] hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
                                    >
                                      {isSending ? 'Sending...' : 'Send'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
`;

file = file.replace(target2, replacement2);
fs.writeFileSync('src/app/(dashboard)/user/my-cases/page.tsx', file);
console.log('Fixed my-cases');
