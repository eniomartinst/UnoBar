class HealthService {
  check() {
    return { status: 'ok', message: 'API is working perfectly!' };
  }
}

export default new HealthService();
