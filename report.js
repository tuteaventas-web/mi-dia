import {today,PRIORITIES} from './model.js';

export function dailyReport(tasks,date=today()) {
  const unique=[...new Map(tasks.map(t=>[t.id,t])).values()];
  const completed=unique.filter(t=>t.state==='Completada'&&t.completed&&today(new Date(t.completed))===date)
    .sort((a,b)=>a.completed.localeCompare(b.completed));
  const pending=unique.filter(t=>t.state!=='Completada'&&t.scheduled&&t.scheduled<=date)
    .sort((a,b)=>PRIORITIES.indexOf(a.priority)-PRIORITIES.indexOf(b.priority)||a.order-b.order);
  const title=t=>t.title.replace(/\s+/g,' ').trim();
  const heading=`**${date.split('-').reverse().join('/')}**`;
  const lines=[...completed.map(t=>`- ${title(t)}`),...pending.map(t=>`- ${title(t)} (PENDIENTE)`)];
  return {text:heading+(lines.length?'\n'+lines.join('\n'):''),completed:completed.length,pending:pending.length};
}
