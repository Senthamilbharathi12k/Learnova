import api from './api'

const getTaskList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.tasks)) return data.tasks
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}

const getTaskObject = (data) => {
  return data?.task || data?.data || data
}

const mapTask = (task) => ({
  id: task.id,
  title: task.title || '',
  course: task.course || '',
  date: task.date || '',
  startTime: task.start_time || task.startTime || '',
  endTime: task.end_time || task.endTime || '',
  category: task.category || 'Study',
  notes: task.notes || '',
  status: task.status || 'PENDING',
  createdAt: task.created_at || task.createdAt || null,
  updatedAt: task.updated_at || task.updatedAt || null,
})

const mapTaskPayload = (task) => ({
  title: task.title.trim(),
  course: task.course?.trim() || '',
  date: task.date,
  start_time: task.startTime || task.start_time,
  end_time: task.endTime || task.end_time,
  category: task.category || 'Study',
  notes: task.notes?.trim() || '',
})

// GET: all planner tasks
export const getPlannerTasks = async () => {
  const response = await api.get('/learning-planner/')
  return getTaskList(response.data).map(mapTask)
}

// POST: create a planner task
export const addPlannerTask = async (task) => {
  const response = await api.post(
    '/learning-planner/',
    mapTaskPayload(task)
  )

  return mapTask(getTaskObject(response.data))
}

// PATCH: update a planner task
export const updatePlannerTask = async (taskId, updates) => {
  const response = await api.patch(
    `/learning-planner/${taskId}/`,
    mapTaskPayload(updates)
  )

  return mapTask(getTaskObject(response.data))
}

// DELETE: remove a planner task
export const deletePlannerTask = async (taskId) => {
  await api.delete(`/learning-planner/${taskId}/`)
  return taskId
}

// PATCH: update task status
export const togglePlannerTask = async (task) => {
  const newStatus =
    task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

  const response = await api.patch(
    `/learning-planner/${task.id}/status/`,
    { status: newStatus }
  )

  return mapTask(getTaskObject(response.data))
}