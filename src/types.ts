// create a new type for the connection info not as a mongoose schema
export type ConnectionInfo = {
  // string in a certain array
  service: 'aws' | 'azure' | 'google' | 'digitalocean' | 'linode' | 'rackspace' | 'vultr' | 'other',
  params: AwsParams | Object
}

export type AwsParams = {
  awsBucket?: string,
  awsKey: string,
  awsSecret?: string,
  awsSecretCrypted?: string,
  awsZone: string,
  ivHex?: string
}
