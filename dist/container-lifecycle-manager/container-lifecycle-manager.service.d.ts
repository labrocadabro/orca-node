import { LoggerService } from 'src/logger/logger.service';
export declare class ContainerLifecycleManagerService {
  private logger;
  constructor(logger: LoggerService);
  exists(podId: string): Promise<boolean>;
  imageUrlValid(imageUrl: any): Promise<boolean>;
  imageExist(imageUrl: string): Promise<boolean>;
  imagePull(imageUrl: string): Promise<void>;
  create(
    podId: string,
    imageUrl: string,
    userEnvVariables: Array<string>,
    internalEnvVariables: Array<string>,
  ): Promise<void>;
  createByPodSpec(podSpec: any): Promise<void>;
  deleteAll(): Promise<void>;
  delete(podId: string): Promise<void>;
}
