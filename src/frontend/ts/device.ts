enum Type {
  Switch = 0,
  Stepper = 1,
  Dimmer = 2
}
class Device{
  public id: number;
  public name: string;
  public description: string;
  public type: Type;
  public state: number;

  constructor(name: string, description: string, type: Type) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.state = 0;

}

public toString(): string{
    return `Dispositivo: ${this.name} (${this.type}) - Estado:  ${this.state}`;
}
}