import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Application types
  type Participant = {
    name : Text;
    sesaId : Text;
    registeredAt : Int;
  };

  type Submission = {
    sesaId : Text;
    name : Text;
    boardState : [Nat];
    timeTakenSeconds : Nat;
    isCorrect : Bool;
    submittedAt : Int;
  };

  let participants = Map.empty<Text, Participant>();
  let submissions = Map.empty<Text, Submission>();

  let clues = [
    1, 0, 0, 4, 0, 6,
    0, 4, 6, 0, 0, 3,
    6, 0, 1, 3, 0, 4,
    3, 0, 4, 1, 0, 5,
    0, 1, 3, 0, 4, 0,
    4, 0, 0, 6, 3, 1
  ];

  let solution = [
    1, 3, 5, 4, 2, 6,
    2, 4, 6, 5, 1, 3,
    6, 5, 1, 3, 2, 4,
    3, 2, 4, 1, 6, 5,
    5, 1, 3, 2, 4, 6,
    4, 6, 2, 6, 3, 1
  ];

  // Public - anyone can get clues (including guests)
  public query ({ caller }) func getClues() : async [Nat] {
    clues;
  };

  // Public - anyone can register (including guests)
  public shared ({ caller }) func registerParticipant(name : Text, sesaId : Text) : async () {
    if (participants.containsKey(sesaId)) {
      Runtime.trap("SESA ID already registered");
    };

    let participant : Participant = {
      name;
      sesaId;
      registeredAt = Time.now();
    };
    participants.add(sesaId, participant);
  };

  // Public query - anyone can check registration status
  public query ({ caller }) func isRegistered(sesaId : Text) : async Bool {
    participants.containsKey(sesaId);
  };

  // Public - anyone can submit (including guests)
  public shared ({ caller }) func submitPuzzle(sesaId : Text, boardState : [Nat], timeTakenSeconds : Nat) : async () {
    if (submissions.containsKey(sesaId)) {
      Runtime.trap("Submission already exists for this SESA ID");
    };

    if (boardState.size() != 36) {
      Runtime.trap("Invalid board state size");
    };

    let isCorrect = Array.tabulate(
      36,
      func(i) { boardState[i] == solution[i] }
    ).all(func(x) { x });

    let name = switch (participants.get(sesaId)) {
      case (?participant) { participant.name };
      case (null) { Runtime.trap("Participant not found") };
    };

    let submission : Submission = {
      sesaId;
      name;
      boardState;
      timeTakenSeconds;
      isCorrect;
      submittedAt = Time.now();
    };
    submissions.add(sesaId, submission);
  };

  // Public query - anyone can check submission status
  public query ({ caller }) func hasSubmitted(sesaId : Text) : async Bool {
    submissions.containsKey(sesaId);
  };

  // Admin-only - sensitive data containing all submissions
  public query ({ caller }) func getSubmissions() : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissions.values().toArray();
  };

  // Admin-only - sensitive data containing all participants
  public query ({ caller }) func getParticipants() : async [Participant] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all participants");
    };
    participants.values().toArray();
  };
};
