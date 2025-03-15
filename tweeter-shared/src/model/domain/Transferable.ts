export abstract class Transferable<D, T extends Transferable<D, T>> {
  abstract get dto(): D;
  public static tFromDto<D, T>(dto: D | null, make: (dto: D) => T): T | null {
    return dto === null ? null : make(dto);
  }
}
