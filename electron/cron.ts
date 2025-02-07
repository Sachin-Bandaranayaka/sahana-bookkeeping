import * as cron from 'node-cron';
import { config } from '../src/lib/config';

class CronService {
    private tasks: cron.ScheduledTask[] = [];
    private baseUrl: string;

    constructor(port: number) {
        this.baseUrl = `http://localhost:${port}`;
    }

    async callApi(endpoint: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/api/${endpoint}`);
            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`Cron job completed for ${endpoint}:`, data);
        } catch (error) {
            console.error(`Cron job failed for ${endpoint}:`, error);
        }
    }

    start() {
        // Schedule daily interest calculation
        this.tasks.push(
            cron.schedule(config.cron.interestCalculation, () => {
                console.log('Running daily interest calculation...');
                this.callApi('cron/calculate-interest');
            })
        );

        // Schedule overdue interest notifications
        this.tasks.push(
            cron.schedule(config.cron.overdueNotification, () => {
                console.log('Sending overdue interest notifications...');
                this.callApi('notifications/overdue-interest');
            })
        );

        console.log('Cron service started');
    }

    stop() {
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
        console.log('Cron service stopped');
    }
}

export default CronService; 