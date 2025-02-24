const moment = require('moment');

class TaskManager {
    constructor() {
        this.tasks = new Map();
    }

    // Menambah tugas baru
    addTask(subject, description, deadline, assignedBy) {
        const taskId = Date.now().toString();
        const task = {
            id: taskId,
            subject,
            description,
            deadline: moment(deadline),
            createdAt: moment(),
            assignedBy,
            status: 'pending',
            submissions: []
        };

        this.tasks.set(taskId, task);
        return taskId;
    }

    // Mendapatkan semua tugas
    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    // Mendapatkan tugas yang belum selesai
    getPendingTasks() {
        return this.getAllTasks().filter(task =>
            task.status === 'pending' && moment().isBefore(task.deadline)
        );
    }

    // Mendapatkan tugas yang sudah lewat deadline
    getOverdueTasks() {
        return this.getAllTasks().filter(task =>
            task.status === 'pending' && moment().isAfter(task.deadline)
        );
    }

    // Mengubah status tugas
    updateTaskStatus(taskId, status) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.status = status;
        this.tasks.set(taskId, task);
        return true;
    }

    // Menambah submission untuk tugas
    addSubmission(taskId, userId, submissionLink) {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        task.submissions.push({
            userId,
            submissionLink,
            submittedAt: moment()
        });

        this.tasks.set(taskId, task);
        return true;
    }

    // Mendapatkan tugas berdasarkan subject
    getTasksBySubject(subject) {
        return this.getAllTasks().filter(task =>
            task.subject.toLowerCase() === subject.toLowerCase()
        );
    }

    // Format tugas untuk ditampilkan
    formatTaskMessage(task) {
        const deadlineFormat = task.deadline.format('DD/MM/YYYY HH:mm');
        const status = task.status.toUpperCase();
        const daysLeft = task.deadline.diff(moment(), 'days');

        return `
📚 *${task.subject}*
📝 ${task.description}
⏰ Deadline: ${deadlineFormat}
📌 Status: ${status}
⌛ Sisa Waktu: ${daysLeft} hari
🆔 Task ID: ${task.id}
👤 Assigned by: ${task.assignedBy}
        `.trim();
    }
}