export class Location {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude inválida. Deve estar entre -90 e 90.');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude inválida. Deve estar entre -180 e 180.');
    }
  }
}
