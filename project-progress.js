export function projectProgress(projects,tasks){
 const unique=[...new Map(tasks.map(t=>[t.id,t])).values()];
 return projects.map(project=>{
  const members=unique.filter(t=>t.project===project.id),total=members.length,done=members.filter(t=>t.state==='Completada').length;
  return {...project,total,done,percent:total?done/total*100:0};
 });
}
