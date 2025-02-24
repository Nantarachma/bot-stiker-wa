const fs = require('fs');
const moment = require('moment');
const dataFilePath = './tasks.json';

class TaskManager {
    constructor() {
        this.tasks = new Map();
        this.loadTasks();
    }

    // Menyimpan data tugas ke file
    saveTasks() {
        const tasksArray = Array.from(this.tasks.values());
        fs.writeFileSync(dataFilePath, JSON.stringify(tasksArray, null, 2));
    }

    // Memuat data tugas dari file
    loadTasks() {
        if (fs.existsSync(dataFilePath)) {
            const tasksArray = JSON.parse(fs.readFileSync(dataFilePath));
            tasksArray.forEach(task => {
                task.deadline = moment(task.deadline);
                task.createdAt = moment(task.createdAt);
                task.submissions = task.submissions.map(submission => ({
                    ...submission,
                    submittedAt: moment(submission.submittedAt)
                }));
                this.tasks.set(task.id, task);
            });
        }
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
        this.saveTasks();
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
        this.saveTasks();
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
        this.saveTasks();
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

module.exports = TaskManager;