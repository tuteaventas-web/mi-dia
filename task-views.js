import {today,week,restore,inDailyScope,summarizeProgress} from './model.js';

// Completed records remain in the same planning views without copying them.
export function inPlanningView(t,view,{day=today(),selectedWeek=week(day),selectedArea='',includeArchived=false}={}) {
  if(view==='done')return t.state==='Completada';
  if(t.state==='Completada'&&t.archivedAt&&!includeArchived)return false;
  if(view==='today')return inDailyScope(t,day);
  if(view==='week')return t.week===week(selectedWeek);
  if(view==='pending')return (!t.scheduled&&!t.week)||!!(t.week&&t.week<week(day))||!!(t.scheduled&&t.scheduled<day);
  if(view==='area')return !!t.area&&(!selectedArea||t.area===selectedArea);
  return false;
}

export function viewProgress(tasks,view,context={}){
  return summarizeProgress(tasks.filter(t=>inPlanningView(t,view,{...context,includeArchived:true})));
}

export function reorderBefore(tasks,source,target,after=false) {
  if(!source||!target||source.id===target.id)return false;
  if(source.state==='Completada'&&target.state!=='Completada')restore(source);
  source.priority=target.priority;
  const ordered=tasks.filter(t=>t.id!==source.id).sort((a,b)=>a.order-b.order||a.created.localeCompare(b.created));
  ordered.splice(ordered.findIndex(t=>t.id===target.id)+(after?1:0),0,source);
  ordered.forEach((t,i)=>t.order=i);
  source.updated=new Date().toISOString();
  return true;
}

export function archiveCompleted(tasks,ids) {
  const selected=new Set(ids);
  const now=new Date().toISOString();
  return tasks.map(t=>t.state==='Completada'&&selected.has(t.id)&&!t.archivedAt?{...t,archivedAt:now,updated:now}:t);
}
