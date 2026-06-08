import { ConfigService } from '@nestjs/config';
import { Kafka, KafkaConfig, SASLOptions } from 'kafkajs';

export function createKafkaClient(
  configService: ConfigService,
  clientId?: string,
) {
  const kafkaConfig: KafkaConfig = {
    clientId: clientId ?? configService.get<string>('KAFKA_CLIENT_ID'),
    brokers: getKafkaBrokers(configService),
    ssl: configService.get<boolean>('KAFKA_SSL') ?? false,
  };

  const sasl = getKafkaSasl(configService);

  if (sasl) {
    kafkaConfig.sasl = sasl;
  }

  return new Kafka(kafkaConfig);
}

export function getKafkaBrokers(configService: ConfigService) {
  return configService
    .get<string>('KAFKA_BROKERS', 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

function getKafkaSasl(configService: ConfigService): SASLOptions | undefined {
  const mechanism = configService.get<string>('KAFKA_SASL_MECHANISM', '');

  if (!mechanism) {
    return undefined;
  }

  const username = configService.get<string>('KAFKA_SASL_USERNAME', '');
  const password = configService.get<string>('KAFKA_SASL_PASSWORD', '');

  if (!username || !password) {
    return undefined;
  }

  return {
    mechanism: mechanism as SASLOptions['mechanism'],
    username,
    password,
  } as SASLOptions;
}
