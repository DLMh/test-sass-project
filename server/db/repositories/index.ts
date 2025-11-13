// Repositories disponibles pour le test
import { TextRepository } from './textRepository.js';
import { CommentRepository } from './commentRepository.js';

// Repositories commentés - non disponibles dans ce projet de test
// import { AutomationDiscussionRepository } from './automationDiscussionRepository';
// import { AutomationRepository } from './automationRepository';
// import { CampaignRepository } from './campaignRepository';
// import { CustomAgentRepository } from './customAgentRepository';
// import { CustomAgentNotificationRepository } from './customAgentNotificationRepository';
// import { ImageGenerationRepository } from './imageGenerationRepository';
// import { OAuthTokenRepository } from './oauthTokenRepository';
// import { SessionRepository } from './sessionRepository';
// import { WorkspaceDocumentRepository } from './workspaceDocumentRepository';
// import { WorkspaceInvitationRepository } from './workspaceInvitationRepository';
// import { WorkspaceRepository } from './workspaceRepository';
// import { ReplyCommentRepository } from './replyCommentRepository.js';
// import { LeadRepository } from './leadRepository';
// import { InboxStatesRepository } from './inboxStatesRepository';

// Singleton instances - on les déclare comme undefined pour éviter l'initialisation au build
let textRepo: TextRepository | undefined;
let commentRepo: CommentRepository | undefined;

// Repositories commentés - non disponibles dans ce projet de test
// let automationDiscussionRepo: AutomationDiscussionRepository | undefined;
// let automationRepo: AutomationRepository | undefined;
// let campaignRepo: CampaignRepository | undefined;
// let customAgentRepo: CustomAgentRepository | undefined;
// let customAgentNotificationRepo: CustomAgentNotificationRepository | undefined;
// let imageGenerationRepo: ImageGenerationRepository | undefined;
// let oauthTokenRepo: OAuthTokenRepository | undefined;
// let sessionRepo: SessionRepository | undefined;
// let workspaceDocumentRepo: WorkspaceDocumentRepository | undefined;
// let workspaceInvitationRepo: WorkspaceInvitationRepository | undefined;
// let workspaceRepo: WorkspaceRepository | undefined;
// let replyCommentRepository: ReplyCommentRepository | null = null;
// let leadRepository: LeadRepository | undefined;
// let inboxStatesRepo: InboxStatesRepository | undefined;

// Getters with lazy initialization
export function getTextRepository(): TextRepository {
  if (!textRepo) {
    textRepo = new TextRepository();
  }
  return textRepo;
}

export function getCommentRepository(): CommentRepository {
  if (!commentRepo) {
    commentRepo = new CommentRepository();
  }
  return commentRepo;
}

// Repositories commentés - non disponibles dans ce projet de test
// export function getAutomationDiscussionRepository(): AutomationDiscussionRepository { ... }
// export function getAutomationRepository(): AutomationRepository { ... }
// export function getCampaignRepository(): CampaignRepository { ... }
// export function getCustomAgentRepository(): CustomAgentRepository { ... }
// export function getCustomAgentNotificationRepository(): CustomAgentNotificationRepository { ... }
// export function getImageGenerationRepository(): ImageGenerationRepository { ... }
// export function getOAuthTokenRepository(): OAuthTokenRepository { ... }
// export function getSessionRepository(): SessionRepository { ... }
// export function getWorkspaceDocumentRepository(): WorkspaceDocumentRepository { ... }
// export function getWorkspaceInvitationRepository(): WorkspaceInvitationRepository { ... }
// export function getWorkspaceRepository(): WorkspaceRepository { ... }
// export function getReplyCommentRepository(): ReplyCommentRepository { ... }
// export function getLeadRepository(): LeadRepository { ... }
// export function getInboxStatesRepository(): InboxStatesRepository { ... }

// Cleanup function for testing purposes
export function clearRepositories(): void {
  textRepo = undefined;
  commentRepo = undefined;
  // Repositories commentés - non disponibles dans ce projet de test
  // automationDiscussionRepo = undefined;
  // automationRepo = undefined;
  // campaignRepo = undefined;
  // customAgentRepo = undefined;
  // customAgentNotificationRepo = undefined;
  // imageGenerationRepo = undefined;
  // oauthTokenRepo = undefined;
  // sessionRepo = undefined;
  // workspaceDocumentRepo = undefined;
  // workspaceInvitationRepo = undefined;
  // workspaceRepo = undefined;
  // replyCommentRepository = null;
  // leadRepository = undefined;
  // inboxStatesRepo = undefined;
} 



